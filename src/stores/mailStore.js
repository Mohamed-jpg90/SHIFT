import { create } from 'zustand';

const mailId = (mail) => String(mail.id ?? mail.beatId ?? `${mail.from}-${mail.subject}`);

export const useMailStore = create((set, get) => ({
  emails: [],
  selectedId: null,

  addEmail: (mail) => {
    const id = mailId(mail);
    const entry = { id, from: mail.from ?? 'LoopOS', subject: mail.subject ?? 'New message', preview: mail.preview ?? '', body: mail.body ?? '', receivedAt: mail.receivedAt ?? Date.now(), read: false };
    set((state) => {
      const existing = state.emails.findIndex((email) => email.id === id);
      const emails = existing < 0 ? [entry, ...state.emails] : state.emails.map((email) => email.id === id ? { ...email, ...entry } : email);
      return { emails, selectedId: state.selectedId ?? id };
    });
  },

  selectEmail: (id) => set((state) => ({
    selectedId: id,
    emails: state.emails.map((email) => email.id === id ? { ...email, read: true } : email),
  })),

  clear: () => set({ emails: [], selectedId: null }),
  getSelected: () => get().emails.find((email) => email.id === get().selectedId) ?? null,
}));
