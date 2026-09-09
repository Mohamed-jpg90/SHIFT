import { useEffect, useState } from 'react';
import { useWhatsUppStore } from '../../../stores/whatsUppStore';

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function WhatsUpp() {
  const chats = useWhatsUppStore((s) => s.chats);
  const activeChatId = useWhatsUppStore((s) => s.activeChatId);
  const setActiveChat = useWhatsUppStore((s) => s.setActiveChat);
  const addMessage = useWhatsUppStore((s) => s.addMessage);
  const [draft, setDraft] = useState('');

  const chatList = Object.values(chats).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.timestamp ?? 0;
    const bLast = b.messages[b.messages.length - 1]?.timestamp ?? 0;
    return bLast - aLast;
  });

  useEffect(() => {
    if (!activeChatId && chatList.length > 0) setActiveChat(chatList[0].id);
  }, [activeChatId, chatList, setActiveChat]);

  const activeChat = activeChatId ? chats[activeChatId] : null;

  const handleSend = () => {
    if (!draft.trim() || !activeChat) return;
    addMessage({
      chatId: activeChat.id,
      from: 'You',
      message: draft.trim(),
      isGroup: activeChat.isGroup,
    });
    setDraft('');
  };

  return (
    <div className="whatsupp">
      <div className="whatsupp__sidebar">
        <p className="app-header">&gt; conversations</p>
        {chatList.length === 0 && <p className="whatsupp__empty">no conversations yet</p>}
        {chatList.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <button
              key={chat.id}
              type="button"
              className={`whatsupp__chat-item${chat.id === activeChatId ? ' whatsupp__chat-item--active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="whatsupp__chat-item-top">
                <span className="whatsupp__chat-name">
                  {chat.name}
                  {chat.isGroup && <span className="tag">group</span>}
                </span>
                {last && <span className="whatsupp__chat-time">{formatTime(last.timestamp)}</span>}
              </div>
              {last && <p className="whatsupp__chat-preview">{last.from}: {last.text}</p>}
            </button>
          );
        })}
      </div>

      <div className="whatsupp__thread">
        {activeChat ? (
          <>
            <div className="whatsupp__thread-header">
              <span>{activeChat.name}</span>
              {activeChat.isGroup && <span className="tag">group</span>}
            </div>

            <div className="whatsupp__messages">
              {activeChat.messages.map((m) => (
                <div key={m.id} className={`whatsupp__bubble${m.from === 'You' ? ' whatsupp__bubble--out' : ''}`}>
                  <span className="whatsupp__bubble-sender">{m.from}</span>
                  <span className="whatsupp__bubble-text">{m.text}</span>
                  <span className="whatsupp__bubble-time">{formatTime(m.timestamp)}</span>
                </div>
              ))}
            </div>

            <div className="whatsupp__composer">
              <span className="term-prompt">&gt;</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="type a message"
              />
              <button type="button" onClick={handleSend}>send</button>
            </div>
          </>
        ) : (
          <div className="app-placeholder">no conversation selected</div>
        )}
      </div>
    </div>
  );
}