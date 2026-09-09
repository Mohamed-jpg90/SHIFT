export default function Browser() {
  return (
    <div className="browser-app">
      <div className="browser-app__bar">
        <span className="term-prompt">&gt;</span>
        <span className="browser-app__url">loop://home</span>
      </div>
      <div className="browser-app__page">
        <p className="browser-app__logo">LOOP</p>
        <p className="browser-app__tagline">internal network — nothing to see yet</p>
      </div>
    </div>
  );
}