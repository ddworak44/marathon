const rest = [0, 'Rest'];
const easy = miles => [miles, 'Easy run'];
const strength = miles => [miles, 'Easy run + optional strength', 'Keep split squats, single-leg deadlifts and calf raises light before Saturday.'];
const strides = miles => [miles, 'Easy run + strides', 'Finish with 4 × 20 seconds relaxed and quick. Walk or jog until recovered.'];
const long = (miles, note) => [miles, 'Long run', note];
const recovery = miles => [miles, 'Recovery run'];

// The opening week runs Wednesday–Sunday. All other weeks run Monday–Sunday.
const phases = [
  {
    id: 'base', title: 'Base', weeks: [
      ['Opening week · Wed–Sun', [easy(7), easy(5), [5, 'Easy run or rest', 'Take the day off if you’re still carrying marathon fatigue.'], long(10), recovery(5)]],
      ['Easy mileage', [rest, easy(7), easy(7), easy(7), strength(5), long(11), recovery(5)]],
      ['Introduce strides', [rest, strides(8), easy(7), easy(7), strength(5), long(12), recovery(6)]],
      ['Build aerobic volume', [rest, strides(8), easy(8), easy(8), strength(5), long(12), recovery(6)]],
      ['Cutback', [rest, easy(7), easy(7), strides(7), strength(5), long(10), recovery(5)]],
      ['Short hills', [rest, [8, 'Hill repeats', '6 × 30 sec uphill at a controlled fast effort. Jog back down and recover fully.'],
        easy(8), easy(8), strength(5), long(13), recovery(6)]],
      ['Finish the base block', [rest, strides(8), easy(8), easy(9), strength(5), long(13), recovery(7)]]
    ]
  },
  {
    id: 'build', title: 'Build', weeks: [
      ['First threshold session', [rest, easy(8), easy(8),
        [9, 'Threshold', '3 × 6 min at threshold effort with 2 min easy jogs.'],
        strength(5), long(13), recovery(7)]],
      ['5K benchmark', [rest, [9, '5K benchmark', 'Run a timed 5K on a flat route. Start controlled, then build to a hard, even effort. Use a recent 5K result if you already have one.'],
        recovery(8), easy(8), strength(6), long(12, 'Keep the full run conversational.'), recovery(7)]],
      ['Longer threshold reps', [rest, strides(9), easy(9),
        [9, 'Threshold', '2 × 12 min at threshold effort with a 3 min easy jog.'],
        strength(6), long(14, 'Choose rolling terrain and keep effort even on climbs. Practice your race fueling.'), recovery(7)]],
      ['Cutback', [rest, strides(8), easy(7), easy(7), strength(5), long(11), recovery(6)]]
    ]
  },
  {
    id: 'race-prep', title: 'Race prep', weeks: [
      ['10K-effort intervals', [rest, [9, 'Intervals', '5 × 3 min at current 10K effort with 2 min easy jogs.'],
        easy(9), easy(9), strength(6), long(14), recovery(7)]],
      ['Threshold endurance', [rest, strides(9), easy(10),
        [10, 'Threshold', '3 × 9 min at threshold effort with 2 min easy jogs.'],
        strength(6), long(14, 'Practice fueling on rolling terrain.'), recovery(7)]],
      ['10K benchmark · reduced mileage', [rest, strides(8), easy(8), easy(8), easy(5),
        [11, '10K benchmark', 'Race a 10K or time yourself over a measured 10K. Start controlled and aim for even effort. The 11 mi includes easy warm-up and cool-down.'],
        recovery(6)]],
      ['Recover and rebuild', [rest, easy(8), easy(8), strides(9), strength(5),
        long(13, 'Keep this aerobic while you recover from the 10K.'), recovery(7)]],
      ['Peak week · race-pace rehearsal', [rest, strides(10), easy(10), easy(10), easy(6),
        long(15, 'If recovered, run 2 × 2 mi at your tentative half-marathon pace in the second half with 3 min easy between reps. Practice race fueling. If the reps feel like a race, reset your target pace.'), recovery(7)]]
    ]
  },
  {
    id: 'taper', title: 'Taper', weeks: [
      ['Freshen up', [rest, [8, 'Half-marathon effort', '2 × 1 mi at planned race effort with a 3 min easy jog.'],
        easy(7), easy(8), easy(5), long(10), recovery(6)]],
      ['Race week · 19 mi before race', [rest, strides(6), easy(5),
        [5, 'Race tune-up', '2 × 5 min at planned race effort with a 2 min easy jog.'],
        rest, [3, 'Shakeout', 'Keep it relaxed.'],
        [13.1, 'United Airlines NYC Half', 'Start controlled and settle into the pace supported by your training.']]]
    ]
  }
];

const dayMs = 24 * 60 * 60 * 1000;
const openingDay = Date.UTC(2026, 10, 18);
const now = new Date();
const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const weekdayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const isoDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);
const milesLabel = miles => `${Number(miles.toFixed(1))} mi`;

let start = openingDay;
let currentWeekId;
const schedule = document.getElementById('weeks');

// The markup below contains only schedule data maintained in this file.
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

    const total = days.reduce((sum, [miles]) => sum + miles, 0);
    const workouts = days.map(([miles, name, note], index) => {
      const date = start + index * dayMs;
      return `<li class="workout"${today === date ? ' aria-current="date"' : ''}>
        <time datetime="${isoDate(date)}">${weekdayLabel.format(date)} <span>${dateLabel.format(date)}</span></time>
        <div><span class="workout-name">${name}</span>${note ? `<span class="workout-note">${note}</span>` : ''}</div>
        <span class="distance">${miles ? milesLabel(miles) : ''}</span>
      </li>`;
    }).join('');

    week.innerHTML = `<summary>
        <span class="week-dates">${dateLabel.formatRange(start, end)}<span class="week-label">${current ? 'This week · ' : ''}${label}</span></span>
        <span class="week-total">${milesLabel(total)}</span>
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
