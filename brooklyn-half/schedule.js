const offDaySteps = 'Optional goal of 15,000–20,000 total steps if that’s close to your usual activity.';
const afterLongRun = ['', 'Recover after the long run', `${offDaySteps} Go lower if your legs are still tired.`];
const midweekWalk = ['', 'Easy walking', offDaySteps];
const rest = ['', 'Rest from running', offDaySteps];
const beforeLongRun = ['', 'Easy day before the long run', `${offDaySteps} Keep the walking relaxed.`];
const raceEve = ['', 'Rest before race day'];
const exampleMinutesPerMile = 16;
const timed = (minutes, name, note) => {
  const miles = minutes.split('–').map(value => Number((Number(value) / exampleMinutesPerMile).toFixed(1))).join('–');
  const estimate = `≈ ${miles} mi.`;
  return [`${minutes} min`, name, note ? `${estimate} ${note}` : estimate];
};
const easy = (minutes, note) => timed(minutes, 'Easy run/walk', note);
const long = (amount, note) => [amount, 'Long run/walk', note];
const longByTime = (minutes, note) => timed(minutes, 'Long run/walk', note);
const firstThursday = easy('15–20', 'Make this a brisk walk if you currently run once a week.');

// Each row starts with its original Monday, which anchors the saved checkmarks.
// Keep it fixed when editing a week. To reschedule, pass { weekOf: 'YYYY-MM-DD' } after the Sunday workout.
const phases = [
  {
    id: 'base', title: 'Base', weeks: [
      ['2026-11-23', 'Start run/walk', easy('15–20', 'Pick the interval and time range in How to start.'),
        firstThursday, longByTime('20–30', 'Keep both the jogs and walks comfortable.')],
      ['2026-11-30', 'Find your rhythm', easy('15–20'), firstThursday, longByTime('25–35')],
      ['2026-12-07', 'Build time on feet', easy('20–25'), easy('15–20'), longByTime('30–40')],
      ['2026-12-14', 'Cutback', easy('15–20'), easy('15–20'), longByTime('25–30')],
      ['2026-12-21', 'Add time to Sunday', easy('20–25'), easy('20–25'), longByTime('35–45')],
      ['2026-12-28', 'Get comfortable around 3 miles', easy('20–25'), easy('20–25'),
        longByTime('40–50', 'Repeat a base week if 3 miles still feels like a stretch.')]
    ]
  },
  {
    id: 'endurance', title: 'Build', weeks: [
      ['2027-01-04', 'Start measuring the long run in miles', easy('25'), easy('20–25'), long('3–3.5 mi')],
      ['2027-01-11', 'Keep the effort easy as distance builds', easy('25–30'), easy('25'), long('3.5–4 mi')],
      ['2027-01-18', 'Practice drinking on the run', easy('25–30'), easy('25–30'),
        long('4–4.5 mi', 'On outings over an hour, try water or a sports drink and a carb source you tolerate.')],
      ['2027-01-25', 'Cutback', easy('20–25'), easy('20–25'), long('3–3.5 mi')],
      ['2027-02-01', 'Build to 5 miles', easy('30'), easy('25–30'), long('4.5–5 mi')],
      ['2027-02-08', 'Practice your fueling', easy('30'), easy('30'),
        long('5–5.5 mi', 'Try the gels, chews or sports drink you may use on race day.')],
      ['2027-02-15', 'Build to 6 miles', easy('30–35'), easy('30'), long('5.5–6 mi')],
      ['2027-02-22', 'Cutback and pace check', easy('25–30'), easy('25'),
        ['4.5–5 mi', 'Long run/walk with pace check',
          'Time 2 flat miles with your planned walk breaks. Record elapsed pace and how it felt.']]
    ]
  },
  {
    id: 'rehearse', title: 'Race prep', weeks: [
      ['2027-03-01', 'Return to 6 miles', easy('35'), easy('30'), long('6–6.5 mi')],
      ['2027-03-08', 'Build to 7 miles', easy('35'), easy('30–35'), long('6.5–7 mi')],
      ['2027-03-15', 'Build to 8 miles', easy('35–40'), easy('30–35'), long('7.5–8 mi')],
      ['2027-03-22', 'Race rehearsal', easy('30–35'), easy('25–30'),
        ['6–7 mi', 'Race rehearsal', 'Use your race shoes, fuel and run/walk pattern on a gently rolling route. Time the middle 3–4 miles at a steady effort you could keep up.']],
      ['2027-03-29', 'Build to 9 miles', easy('35–40'), easy('30–35'),
        long('8.5–9 mi', 'Cap the outing at 2½ hours, even if you’re short of the distance.')],
      ['2027-04-05', 'Longest run', easy('30–35'), easy('25–30'),
        long('9–10 mi', 'Aim for this distance if the build has gone well. Stop at 2½ hours and note your elapsed pace, how you finish and how you recover.')]
    ]
  },
  {
    id: 'taper', title: 'Taper', weeks: [
      ['2027-04-12', 'Reduce the distance', easy('25'), easy('20–25'), long('5–6 mi', 'Keep it relaxed.')],
      ['2027-04-19', 'Race week', easy('20'), easy('15'),
        ['13.1 mi', 'Brooklyn Experience Half Marathon',
          'Start easy and use the walk breaks you practiced. Meet up at your agreed spot after the finish.'], { saturday: raceEve }]
    ]
  }
];

function scheduleWeek([originalWeekOf, label, tuesday, thursday, sunday, options = {}]) {
  const { weekOf = originalWeekOf, saturday = beforeLongRun } = options;
  const days = [afterLongRun, tuesday, midweekWalk, thursday, rest, saturday, sunday];

  // The original workout dates match the keys already saved in browsers.
  const trackedDays = days.map(([amount, name, note], dayIndex) => {
    if (!amount) return [amount, name, note];
    const originalDate = new Date(originalWeekOf);
    originalDate.setUTCDate(originalDate.getUTCDate() + dayIndex);
    return [amount, name, note, originalDate.toISOString().slice(0, 10)];
  });
  return [label, trackedDays, Date.parse(weekOf)];
}

const calendar = phases.map(phase => ({ ...phase, weeks: phase.weeks.map(scheduleWeek) }));

renderHalfTraining({
  openingDay: Date.UTC(2026, 10, 23),
  phases: calendar,
  summarizeWeek: days => `Sun · ${days.at(-1)[0]}`,
  completionStorageKey: 'marathon:brooklyn-half:2027:complete'
});
