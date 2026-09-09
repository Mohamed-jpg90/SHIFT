export default function Calendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="calendar-app">
      <p className="app-header">&gt; {monthName.toLowerCase()} {year}</p>
      <div className="calendar-app__grid">
        {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d) => (
          <span key={d} className="calendar-app__weekday">{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`calendar-app__day${day === today.getDate() ? ' calendar-app__day--today' : ''}`}
          >
            {day ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}