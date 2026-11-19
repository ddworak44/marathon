function renderHalfTraining({ openingDay, phases, summarizeWeek, formatAmount = amount => amount }) {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const weekdayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
  const isoDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);

  let start = openingDay;
  let currentWeekId;
  const schedule = document.getElementById('weeks');

  // Plan data passed to this renderer is maintained in the repository.
  for (const { id, title, weeks } of phases) {
    const section = document.createElement('section');
    section.className = 'phase';
    section.id = id;
    section.setAttribute('aria-labelledby', `${id}-title`);
    section.innerHTML = `<h3 id="${id}-title">${title}</h3>`;

    for (const [label, days] of weeks) {
      const end = start + (days.length - 1) * dayMs;
      const current = start <= today && today <= end;
      const week = document.createElement('details');
      week.id = `week-${isoDate(start)}`;
      week.open = current || (today < openingDay && start === openingDay);
      if (current) {
        week.className = 'current';
        currentWeekId = week.id;
      }

      const summary = summarizeWeek(days);
      const workouts = days.map(([amount, name, note], index) => {
        const date = start + index * dayMs;
        return `<li class="workout"${today === date ? ' aria-current="date"' : ''}>
          <time datetime="${isoDate(date)}">${weekdayLabel.format(date)} <span>${dateLabel.format(date)}</span></time>
          <div><span class="workout-name">${name}</span>${note ? `<span class="workout-note">${note}</span>` : ''}</div>
          <span class="distance">${amount ? formatAmount(amount) : ''}</span>
        </li>`;
      }).join('');

      week.innerHTML = `<summary>
          <span class="week-dates">${dateLabel.formatRange(start, end)}<span class="week-label">${current ? 'This week · ' : ''}${label}</span></span>
          <span class="week-total">${summary}</span>
        </summary>
        <ul class="workouts">${workouts}</ul>`;
      section.append(week);
      start = end + dayMs;
    }

    schedule.append(section);
  }

  if (currentWeekId) {
    const jump = document.getElementById('current-week');
    jump.href = `#${currentWeekId}`;
    jump.addEventListener('click', () => { document.getElementById(currentWeekId).open = true; });
    jump.hidden = false;
  }
}
