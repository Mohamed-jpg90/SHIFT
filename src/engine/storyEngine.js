/**
 * src/engine/storyEngine.js
 *
 * Reads scenario data (data/scenarios/*) and executes each event in
 * order against osStore / storyStore. This is the only place that
 * translates story data into actual side effects — no app component
 * and no scenario file should call osStore or setTimeout directly.
 *
 * Phase 5.3 status: WAIT, OPEN_APP, CLOSE_APP, NOTIFICATION, COMPLETE
 * are fully implemented.
 * Phase 5.5 status: SEND_MESSAGE is fully implemented (writes to
 * whatsUppStore + fires an OS notification if WhatsUpp isn't visible).
 * VIDEO_CALL and CHOICE are still logged and skipped (rest of 5.5).
 * CODE_CHALLENGE (Phase 5.6) is also still logged and skipped.
 */

import { useOsStore } from '../stores/osStore';
import { useStoryStore } from '../stores/storyStore';
import { useWhatsUppStore } from '../stores/whatsUppStore';
import { STORY_EVENT_TYPES as T } from '../data/scenarios/storyEventTypes';
import { chapter1 } from '../data/scenarios/chapter1';

const CHAPTERS = {
  1: chapter1,
};

const DEFAULT_WAIT_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function getScenario(chapterId, scenarioId) {
  const chapter = CHAPTERS[chapterId];
  return chapter?.scenarios.find((s) => s.id === scenarioId) ?? null;
}

/**
 * Executes a single event. Returns a promise that resolves once the
 * event's effect has been applied (and, for WAIT, once time's up).
 */
async function executeEvent(event) {
  switch (event.type) {
    case T.WAIT: {
      await wait(event.duration ?? DEFAULT_WAIT_MS);
      break;
    }

    case T.OPEN_APP: {
      useOsStore.getState().openWindow(event.appId, event.overrides);
      break;
    }

    case T.CLOSE_APP: {
      const { windows, closeWindow } = useOsStore.getState();
      const target = Object.values(windows).find(
        (w) => w.appId === event.appId
      );
      if (target) closeWindow(target.id);
      break;
    }

    case T.NOTIFICATION: {
      useOsStore.getState().addNotification(event.notification);
      break;
    }

    case T.SEND_MESSAGE: {
      const chatId = event.group ?? event.from;
      useWhatsUppStore.getState().addMessage({
        chatId,
        from: event.from,
        message: event.message,
        isGroup: Boolean(event.group),
      });

      // If WhatsUpp isn't open (or is minimized), surface an OS
      // notification too, same as a real chat app would.
      const whatsUppVisible = Object.values(
        useOsStore.getState().windows
      ).some((w) => w.appId === 'whatsUpp' && !w.isMinimized);

      if (!whatsUppVisible) {
        useOsStore.getState().addNotification({
          appId: 'whatsUpp',
          title: event.from,
          message: event.message,
          type: 'message',
        });
      }
      break;
    }

   case T.COMPLETE: {
  useStoryStore.getState().completeCurrentScenario();
  return { completed: true };
}



    case T.VIDEO_CALL: {
  await useStoryStore.getState().startVideoCall({
    character: event.character,
    mode: event.mode,
    message: event.message,
  });
  break;
}

case T.CHOICE: {
  const optionId = await useStoryStore.getState().startChoice({
    prompt: event.prompt,
    options: event.options, // [{ id, label, goto? }]
  });
  const chosen = event.options.find((o) => o.id === optionId);
  return chosen?.goto !== undefined ? { jumpTo: chosen.goto } : undefined;
}

case T.CODE_CHALLENGE: {
  const challengePromise = useStoryStore.getState().startCodeChallenge({
    challengeId: event.challengeId,
    storyText: event.storyText,
    context: event.context,
    task: event.task,
    referenceSolution: event.referenceSolution,
  });
  useOsStore.getState().openWindow(event.appId ?? 'loopCode');
  await challengePromise;
  break;
}

    default: {
      console.warn(`[storyEngine] Unknown event type "${event.type}"`, event);
    }
  }
}

/**
 * Runs every event of a scenario in order, updating storyStore's
 * currentEventIndex as it goes. Awaits each event before moving to
 * the next, so WAIT events actually pause the sequence.
 *
 * NOTE: once CHOICE/CODE_CHALLENGE are implemented (5.5/5.6), this
 * loop will need to pause and be resumed externally (e.g. by a
 * ChoiceModal callback or a successful code submission) instead of
 * plowing straight through. That's a Phase 5.5/5.6 concern.
 */
export async function runScenario(chapterId, scenarioId) {
  const scenario = getScenario(chapterId, scenarioId);
  if (!scenario) {
    console.warn(
      `[storyEngine] Scenario ${chapterId}.${scenarioId} not found.`
    );
    return;
  }

  const { startScenario, setEventIndex } = useStoryStore.getState();
  startScenario(chapterId, scenarioId);

 for (let i = 0; i < scenario.events.length; i += 1) {
  setEventIndex(i);
  const result = await executeEvent(scenario.events[i]);
  if (result?.completed) break;
  if (result?.jumpTo !== undefined) i = result.jumpTo - 1;
}
}