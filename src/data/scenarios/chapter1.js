/**
 * src/data/scenarios/chapter1.js
 *
 * Pure data — no JSX, no timers, no store calls. storyEngine.js reads
 * this and executes each event in order.
 *
 * Only Scenario 1 is filled in for now (Phase 5.2), to prove the
 * engine architecture before transcribing the rest of Chapter 1.
 * Content is taken as-is from the SHIFT Chapter 1 design doc.
 *
 * Event types used here that the engine doesn't execute yet
 * (SEND_MESSAGE, VIDEO_CALL, CODE_CHALLENGE) are still written in
 * full — storyEngine.js currently logs+skips them until Phase 5.5/5.6.
 */

import { STORY_EVENT_TYPES as T } from './storyEventTypes';

export const chapter1 = {
  id: 1,
  title: 'Chapter 1',

  scenarios: [
    {
      id: 1,
      title: 'أول يوم — Variables',

      events: [
        {
          type: T.NOTIFICATION,
          notification: {
            type: 'info',
            title: 'System',
            message: "You've been added to 'Loop Team' group chat.",
          },
        },

        {
          type: T.VIDEO_CALL,
          character: 'Youssef',
          mode: 'incoming',
          autoAnswer: false,
          message:
            'صباح الخير يا Mohamed. هقولك حاجة تريحك — مش مطلوب منك تكون عبقري كمبيوتر النهاردة. مطلوب منك بس تفهم فكرة واحدة صغيرة.',
        },
        {
          type: T.VIDEO_CALL,
          character: 'Youssef',
          mode: 'continue',
          message:
            "الـ Variable ببساطة زي ما تكتب اسمك على علبة وتحط جواها حاجة — بعدين لو حد قالك 'هات اللي في العلبة'، تقدر تجيبها من غير ما تفتكر إيه اللي فيها من الأول. والـ Print يعني إنك تفتح العلبة وتوريها لحد تاني — يعني 'اعرضها على الشاشة'.",
        },
        {
          type: T.VIDEO_CALL,
          character: 'Youssef',
          mode: 'continue',
          message: 'بس كده. جرب بنفسك دلوقتي في LoopCode، وأنا موجود لو اتعقدت.',
        },
        {
          type: T.WAIT,
          duration: 1500,
        },

        {
          type: T.SEND_MESSAGE,
          app: 'whatsUpp',
          from: 'Nadine',
          group: 'Loop Team',
          message: 'يلا بينا نشوف الجيل الجديد',
        },

        {
          type: T.NOTIFICATION,
          notification: {
            type: 'info',
            appId: 'loopCode',
            title: 'LoopOS',
            message: 'New app unlocked: LoopCode',
          },
        },

        {
          type: T.OPEN_APP,
          appId: 'loopCode',
        },

        {
          type: T.CODE_CHALLENGE,
          challengeId: 'ch1-s1-variables',
          requiredToContinue: true,
          storyText:
            'فاكر العلبة؟ طنط ليلى عايزة الكمبيوتر يفتكر سعر الإسبريسو. يعني محتاجين نسمّي العلبة (Variable)، ونحط جواها القيمة (السعر)، وبعدين نطبعها (نوريها على الشاشة).',
          context: 'طنط ليلى عايزة الكمبيوتر يفتكر سعر الإسبريسو (18 جنيه).',
          task: 'اكتب المتغير اللي يخلي الكمبيوتر يتذكر السعر ده، وبعدين اطبعه.',
          referenceSolution: 'espressoPrice = 18;\nprint(espressoPrice);',
        },

        {
          type: T.SEND_MESSAGE,
          app: 'whatsUpp',
          from: 'Nadine',
          group: 'Loop Team',
          message: 'مش وحش أوي يلا بقى يا Byte',
        },

        {
          type: T.NOTIFICATION,
          notification: {
            type: 'success',
            title: 'Achievement Unlocked',
            message: 'أول Variable — Nadine officially nicknames him "Byte".',
          },
        },

        {
          type: T.COMPLETE,
        },
      ],
    },

    // Scenarios 2–10 added incrementally once the engine supports
    // SEND_MESSAGE / VIDEO_CALL / CHOICE / CODE_CHALLENGE.
  ],
};