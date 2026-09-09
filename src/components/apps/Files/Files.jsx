const FILES = [
  { name: 'onboarding-notes.txt', kind: 'file' },
  { name: 'espresso-recipe.txt', kind: 'file' },
  { name: 'Projects', kind: 'folder' },
];

export default function Files() {
  return (
    <div className="files-app">
      <p className="app-header">&gt; home</p>
      <div className="files-app__grid">
        {FILES.map((f) => (
          <div key={f.name} className="files-app__item">
            <span className="files-app__icon">{f.kind === 'folder' ? '📁' : '📄'}</span>
            <span className="files-app__name">{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}