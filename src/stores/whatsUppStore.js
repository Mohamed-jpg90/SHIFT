/**
 * src/stores/whatsUppStore.js
 *
 * Holds WhatsUpp chats (1:1 or group) and their messages. storyEngine
 * writes to this via SEND_MESSAGE events; the WhatsUpp app component
 * only reads from it (+ setActiveChat when the player clicks a chat).
 *
 * chatId is just the group name or contact name (e.g. "Loop Team",
 * "Salma") — matches how scenarios already reference `group`/`from`.
 */

import { create } from 'zustand';

let messageCounter = 0;
const nextMessageId = () => `msg-${++messageCounter}`;

export const useWhatsUppStore = create((set, get) => ({
  chats: {}, // chatId -> { id, name, isGroup, messages: [] }
  activeChatId: null,

  /** Creates the chat if it doesn't exist yet. No-op otherwise. */
  ensureChat: (chatId, meta = {}) => {
    if (get().chats[chatId]) return;
    set((s) => ({
      chats: {
        ...s.chats,
        [chatId]: {
          id: chatId,
          name: meta.name ?? chatId,
          isGroup: meta.isGroup ?? false,
          messages: [],
        },
      },
    }));
  },

  /**
   * Appends a message to a chat, creating the chat first if needed.
   * Returns the new message's id.
   */
  addMessage: ({ chatId, from, message, isGroup = false }) => {
    get().ensureChat(chatId, { name: chatId, isGroup });

    const entry = {
      id: nextMessageId(),
      from,
      text: message,
      timestamp: Date.now(),
    };

    set((s) => ({
      chats: {
        ...s.chats,
        [chatId]: {
          ...s.chats[chatId],
          messages: [...s.chats[chatId].messages, entry],
        },
      },
    }));

    return entry.id;
  },

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  getChatList: () => Object.values(get().chats),
}));