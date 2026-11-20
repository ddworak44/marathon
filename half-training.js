function renderHalfTraining({ openingDay, phases, summarizeWeek, formatAmount = amount => amount, completionStorageKey }) {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const weekdayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
  const isoDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);

  let start = openingDay;
  let firstWeek = true;
  let currentWeekId;
  const schedule = document.getElementById('weeks');

  // Plan data passed to this renderer is maintained in the repository.
  for (const { id, title, weeks } of phases) {
    const section = document.createElement('section');
    section.className = 'phase';
    section.id = id;
    section.setAttribute('aria-labelledby', `${id}-title`);
    section.innerHTML = `<h3 id="${id}-title">${title}</h3>`;

    for (const [label, days, weekStart = start] of weeks) {
      const end = weekStart + (days.length - 1) * dayMs;
      const current = weekStart <= today && today <= end;
      const week = document.createElement('details');
      week.id = `week-${isoDate(weekStart)}`;
      week.open = current || (today < weekStart && firstWeek);
      if (current) {
        week.className = 'current';
        currentWeekId = week.id;
      }

      const summary = summarizeWeek(days);
      const workouts = days.map(([amount, name, note, completionId], index) => {
        const date = weekStart + index * dayMs;
        const workoutDate = isoDate(date);
        const amountLabel = `<span class="distance">${amount ? formatAmount(amount) : ''}</span>`;
        const actions = completionStorageKey && amount
          ? `<div class="workout-actions">${amountLabel}
              <label class="workout-toggle">
                <input type="checkbox" data-workout-id="${completionId ?? workoutDate}"
                  aria-label="Complete ${name} on ${dateLabel.format(date)}">
                <span aria-hidden="true">✓</span>
              </label>
            </div>`
          : amountLabel;
        return `<li class="workout"${today === date ? ' aria-current="date"' : ''}>
          <time datetime="${workoutDate}">${weekdayLabel.format(date)} <span>${dateLabel.format(date)}</span></time>
          <div><span class="workout-name">${name}</span>${note ? `<span class="workout-note">${note}</span>` : ''}</div>
          ${actions}
        </li>`;
      }).join('');

      week.innerHTML = `<summary>
          <span class="week-dates">${dateLabel.formatRange(weekStart, end)}<span class="week-label">${current ? 'This week · ' : ''}${label}</span></span>
          <span class="week-total">${summary}</span>
        </summary>
        <ul class="workouts">${workouts}</ul>`;
      section.append(week);
      start = end + dayMs;
      firstWeek = false;
    }

    schedule.append(section);
  }

  if (currentWeekId) {
    const jump = document.getElementById('current-week');
    jump.href = `#${currentWeekId}`;
    jump.addEventListener('click', () => { document.getElementById(currentWeekId).open = true; });
    jump.hidden = false;
  }

  if (completionStorageKey) {
    bindWorkoutCompletion(schedule, completionStorageKey);
  }
}

function bindWorkoutCompletion(schedule, storageKey) {
  const selector = 'input[data-workout-id]';
  const toggles = schedule.querySelectorAll(selector);
  const status = document.getElementById('completion-status');
  const prefix = `${storageKey}:`;
  const keyFor = toggle => prefix + toggle.dataset.workoutId;
  const showStorageError = () => {
    status.textContent = 'This browser could not save your checkmarks. They will stay visible during this visit.';
  };

  function restore() {
    try {
      for (const toggle of toggles) {
        toggle.checked = localStorage.getItem(keyFor(toggle)) === '1';
      }
    } catch {
      showStorageError();
    }
  }

  status.hidden = false;
  restore();

  schedule.addEventListener('change', ({ target }) => {
    if (!target.matches(selector)) return;
    try {
      const key = keyFor(target);
      if (target.checked) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
    } catch {
      showStorageError();
    }
  });

  window.addEventListener('storage', ({ key }) => {
    if (key === null || key.startsWith(prefix)) restore();
  });
}
