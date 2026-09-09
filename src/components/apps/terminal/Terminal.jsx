import { useState } from 'react';

const WELCOME = ['LoopOS terminal v1.0', 'type "help" for a list of commands'];

const COMMANDS = {
  help: () => 'available: help, whoami, date, clear',
  whoami: () => 'byte@loop-os',
  date: () => new Date().toString(),
};

export default function Terminal() {
  const [lines, setLines] = useState(WELCOME);
  const [input, setInput] = useState('');

  const runCommand = () => {
    const cmd = input.trim();
    if (!cmd) return;
    if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    }
    const output = COMMANDS[cmd] ? COMMANDS[cmd]() : `command not found: ${cmd}`;
    setLines((prev) => [...prev, `> ${cmd}`, output]);
    setInput('');
  };

  return (
    <div className="terminal-app">
      <div className="terminal-app__output">
        {lines.map((line, i) => <p key={i} className="terminal-app__line">{line}</p>)}
      </div>
      <div className="terminal-app__input-row">
        <span className="term-prompt">&gt;</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runCommand()}
        />
      </div>
    </div>
  );
}