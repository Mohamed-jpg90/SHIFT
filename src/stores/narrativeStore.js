import { create } from 'zustand';
import { STORY_EVENT_TYPES as T } from '../data/scenarios/storyEventTypes';
import * as gameApi from '../api/gameApi';
import * as practiceApi from '../api/practiceApi';

const APP_TO_WINDOW = { WhatsUpp: 'whatsUpp', MailLoop: 'mailLoop', LoopCode: 'loopCode' };

function beatToEvents(beat) {
  const events = [];
  const delay = Number(beat.delaySeconds) || 0;
  if (delay > 0) events.push({ type: T.WAIT, duration: delay * 1000 });

  const content = beat.contentJson || {};

  switch (beat.app) {
    case 'WhatsUpp':
      events.push({ type: T.OPEN_APP, appId: APP_TO_WINDOW.WhatsUpp });
      events.push({ type: T.SEND_MESSAGE, from: beat.senderName ?? 'System', group: content.group, message: content.text });
      break;
    case 'MailLoop':
      events.push({ type: T.OPEN_APP, appId: APP_TO_WINDOW.MailLoop });
      events.push({ type: T.ADD_MAIL, mail: { id: beat.beatId, from: beat.senderName, subject: content.subject ?? 'New message', preview: content.preview ?? content.text, body: content.body ?? content.text } });
      events.push({ type: T.NOTIFICATION, notification: { type: 'info', appId: 'mailLoop', title: beat.senderName ?? 'MailLoop', message: content.text } });
      break;
    case 'LoopCode':
      events.push({ type: T.OPEN_APP, appId: APP_TO_WINDOW.LoopCode });
      if (content.task_id) {
        // Only a real practice gate when the backend actually attaches a task_id
        events.push({ type: T.CODE_CHALLENGE, taskId: content.task_id, beatId: beat.beatId });
      } else {
        // Pure narrative content shown inside the LoopCode window (menu file, code sample, etc.)
        events.push({ type: T.LOOPCODE_VIEW, text: content.text, sender: beat.senderName });
      }
      break;
  case 'VideoCall':
  events.push({
    type: T.VIDEO_CALL,
    character: beat.senderName,
    avatar: content.avatar,
    mode: 'incoming',
    message: content.text
  });
  break;
    case 'Notification':
    case 'System':
    default:
      events.push({ type: T.NOTIFICATION, notification: { type: 'info', title: beat.senderName ?? 'System', message: content.text } });
      break;
  }

  if (beat.hasChoices && Array.isArray(beat.choices) && beat.choices.length) {
    events.push({
      type: T.CHOICE,
      beatId: beat.beatId,
      prompt: content.text,
      options: [...beat.choices].sort((a, b) => a.choiceIndex - b.choiceIndex)
        .map((c) => ({ id: c.choiceId, label: c.choiceText })),
    });
  } else {
    const readTimeMs = Math.min(4500, Math.max(1200, (content.text?.length ?? 0) * 25));
    events.push({ type: T.WAIT, duration: readTimeMs });
  }
  return events;
}

function mapBeatsToEvents(beats) {
  const ordered = [...beats].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
  return [...ordered.flatMap((beat) => beatToEvents(beat).map((event) => ({ ...event, beatId: beat.beatId }))), { type: T.COMPLETE }];
}

export const useNarrativeStore = create((set, get) => ({
  playerId: null,
  shiftId: null,
  currentBeatId: null,
  shift: null,
  gateCleared: false,
  narrativeComplete: false,
  practiceError: null,
  rawBeats: [],
  events: [],
  isLoading: false,
  error: null,

  loadShift: async (playerId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await gameApi.startShift(playerId);
      const beats = data.beats ?? [];
      set({ playerId, shiftId: data.shiftId, shift: data.shift ?? null, currentBeatId: beats[0]?.beatId ?? null, rawBeats: beats, events: mapBeatsToEvents(beats), gateCleared: false, narrativeComplete: false, practiceError: null, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err?.response?.data?.description ?? err.message });
      return false;
    }
  },

  setCheckpoint: (beatId) => set({ currentBeatId: beatId }),
  setNarrativeComplete: (complete = true) => set({ narrativeComplete: complete }),
  setGateCleared: (cleared = true) => set({ gateCleared: cleared }),

  loadNextPracticeTask: async () => {
    const { playerId, shiftId } = get();
    if (!playerId || !shiftId) return null;
    set({ practiceError: null });
    try {
      return await practiceApi.getNextPracticeTask(playerId, shiftId);
    } catch (err) {
      set({ practiceError: err?.response?.data?.description ?? err?.message ?? 'Could not load the next practice task.' });
      return null;
    }
  },

  endCurrentShift: async () => {
    const { playerId, gateCleared } = get();
    if (!playerId || !gateCleared) return false;
    set({ isLoading: true, error: null });
    try {
      await gameApi.endShift(playerId);
      set({ isLoading: false, rawBeats: [], events: [], currentBeatId: null, shift: null, shiftId: null, narrativeComplete: false, gateCleared: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err?.response?.data?.description ?? err?.message ?? 'Could not end this shift.' });
      return false;
    }
  },
}));
