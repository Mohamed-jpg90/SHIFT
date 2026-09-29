/**
 * src/data/scenarios/storyEventTypes.js
 *
 * The vocabulary scenario data is written in. storyEngine.js knows
 * how to execute each of these; scenario files only ever describe
 * events using these type strings, never DOM/timing/window logic
 * directly.
 *
 * Support status (see storyEngine.js):
 *   WAIT, OPEN_APP, CLOSE_APP, NOTIFICATION, COMPLETE  -> Phase 5.3 (live)
 *   SEND_MESSAGE                                        -> Phase 5.5 (live)
 *   VIDEO_CALL, CHOICE                                  -> Phase 5.5 (pending)
 *   CODE_CHALLENGE                                       -> Phase 5.6 (pending)
 */

export const STORY_EVENT_TYPES = {
  OPEN_APP: 'OPEN_APP',
  CLOSE_APP: 'CLOSE_APP',
  SEND_MESSAGE: 'SEND_MESSAGE',
  NOTIFICATION: 'NOTIFICATION',
  WAIT: 'WAIT',
  VIDEO_CALL: 'VIDEO_CALL',
  CHOICE: 'CHOICE',
  CODE_CHALLENGE: 'CODE_CHALLENGE',
  LOOPCODE_VIEW: 'LOOPCODE_VIEW', // new: read-only narrative content shown in LoopCode window
  COMPLETE: 'COMPLETE',
};