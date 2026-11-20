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

const phases = [
  {
    id: 'base', title: 'Base', weeks: [
      ['Start run/walk', easy('15–20', 'Pick the interval and time range in How to start.'),
        firstThursday, longByTime('20–30', 'Keep both the jogs and walks comfortable.')],
      ['Find your rhythm', easy('15–20'), firstThursday, longByTime('25–35')],
      ['Build time on feet', easy('20–25'), easy('15–20'), longByTime('30–40')],
      ['Cutback', easy('15–20'), easy('15–20'), longByTime('25–30')],
      ['Add time to Sunday', easy('20–25'), easy('20–25'), longByTime('35–45')],
      ['Get comfortable around 3 miles', easy('20–25'), easy('20–25'),
        longByTime('40–50', 'Repeat a base week if 3 miles still feels like a stretch.')]
    ]
  },
  {
    id: 'endurance', title: 'Build', weeks: [
      ['Start measuring the long run in miles', easy('25'), easy('20–25'), long('3–3.5 mi')],
      ['Keep the effort easy as distance builds', easy('25–30'), easy('25'), long('3.5–4 mi')],
      ['Practice drinking on the run', easy('25–30'), easy('25–30'),
        long('4–4.5 mi', 'On outings over an hour, try water or a sports drink and a carb source you tolerate.')],
      ['Cutback', easy('20–25'), easy('20–25'), long('3–3.5 mi')],
      ['Build to 5 miles', easy('30'), easy('25–30'), long('4.5–5 mi')],
      ['Practice your fueling', easy('30'), easy('30'),
        long('5–5.5 mi', 'Try the gels, chews or sports drink you may use on race day.')],
      ['Build to 6 miles', easy('30–35'), easy('30'), long('5.5–6 mi')],
      ['Cutback and pace check', easy('25–30'), easy('25'),
        ['4.5–5 mi', 'Long run/walk with pace check',
          'Time 2 flat miles with your planned walk breaks. Record elapsed pace and how it felt.']]
    ]
  },
  {
    id: 'rehearse', title: 'Race prep', weeks: [
      ['Return to 6 miles', easy('35'), easy('30'), long('6–6.5 mi')],
      ['Build to 7 miles', easy('35'), easy('30–35'), long('6.5–7 mi')],
      ['Build to 8 miles', easy('35–40'), easy('30–35'), long('7.5–8 mi')],
      ['Race rehearsal', easy('30–35'), easy('25–30'),
        ['6–7 mi', 'Race rehearsal', 'Use your race shoes, fuel and run/walk pattern on a gently rolling route. Time the middle 3–4 miles at a steady effort you could keep up.']],
      ['Build to 9 miles', easy('35–40'), easy('30–35'),
        long('8.5–9 mi', 'Cap the outing at 2½ hours, even if you’re short of the distance.')],
      ['Longest run', easy('30–35'), easy('25–30'),
        long('9–10 mi', 'Aim for this distance if the build has gone well. Stop at 2½ hours and note your elapsed pace, how you finish and how you recover.')]
    ]
  },
  {
    id: 'taper', title: 'Taper', weeks: [
      ['Reduce the distance', easy('25'), easy('20–25'), long('5–6 mi', 'Keep it relaxed.')],
      ['Race week', easy('20'), easy('15'),
        ['13.1 mi', 'Brooklyn Experience Half Marathon',
          'Start easy and use the walk breaks you practiced. Meet up at your agreed spot after the finish.'], raceEve]
    ]
  }
];

const calendar = phases.map(({ id, title, weeks }) => ({
  id,
  title,
  weeks: weeks.map(([label, tuesday, thursday, sunday, saturday = beforeLongRun]) => [
    label, [afterLongRun, tuesday, midweekWalk, thursday, rest, saturday, sunday]
  ])
}));

renderHalfTraining({
  openingDay: Date.UTC(2026, 10, 23),
  phases: calendar,
  summarizeWeek: days => `Sun · ${days.at(-1)[0]}`,
  completionStorageKey: 'marathon:brooklyn-half:2027:complete'
});
