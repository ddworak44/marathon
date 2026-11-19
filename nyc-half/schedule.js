const rest = [0, 'Rest'];
const easy = miles => [miles, 'Easy run'];
const strength = miles => [miles, 'Easy run + optional strength', 'Keep split squats, single-leg deadlifts and calf raises light before Friday.'];
const strides = miles => [miles, 'Easy run + strides', 'Finish with 4 × 20 seconds relaxed and quick. Walk or jog until recovered.'];
const long = (miles, note) => [miles, 'Long run', note];
const recovery = miles => [miles, 'Recovery run'];

// The opening week runs Wednesday–Sunday. All other weeks run Monday–Sunday.
const phases = [
  {
    id: 'base', title: 'Base', weeks: [
      ['Opening week · Wed–Sun', [easy(7), easy(5), long(10),
        [5, 'Recovery run or rest', 'Take the day off if you’re still carrying marathon fatigue.'], rest]],
      ['Easy mileage', [easy(5), easy(7), strength(7), easy(7), long(11), recovery(5), rest]],
      ['Introduce strides', [easy(6), strides(8), strength(7), easy(7), long(12), recovery(5), rest]],
      ['Build aerobic volume', [easy(6), strides(8), strength(8), easy(8), long(12), recovery(5), rest]],
      ['Cutback', [easy(5), strides(7), strength(7), easy(7), long(10), recovery(5), rest]],
      ['Short hills', [easy(6), [8, 'Hill repeats', '6 × 30 sec uphill at a controlled fast effort. Jog back down and recover fully.'],
        strength(8), easy(8), long(13), recovery(5), rest]],
      ['Finish the base block', [easy(7), strides(8), strength(8), easy(9), long(13), recovery(5), rest]]
    ]
  },
  {
    id: 'build', title: 'Build', weeks: [
      ['First threshold session', [easy(7), [9, 'Threshold', '3 × 6 min at threshold effort with 2 min easy jogs.'],
        strength(8), easy(8), long(13), recovery(5), rest]],
      ['5K benchmark', [easy(7), [9, '5K benchmark', 'Run a timed 5K on a flat route. Start controlled, then build to a hard, even effort. Use a recent 5K result if you already have one.'],
        recovery(8), easy(8), long(12, 'Keep the full run conversational.'), recovery(6), rest]],
      ['Longer threshold reps', [easy(7), [9, 'Threshold', '2 × 12 min at threshold effort with a 3 min easy jog.'],
        strength(9), easy(9), long(14, 'Choose rolling terrain and keep effort even on climbs. Practice your race fueling.'), recovery(6), rest]],
      ['Cutback', [easy(6), strides(8), strength(7), easy(7), long(11), recovery(5), rest]]
    ]
  },
  {
    id: 'race-prep', title: 'Race prep', weeks: [
      ['10K-effort intervals', [easy(7), [9, 'Intervals', '5 × 3 min at current 10K effort with 2 min easy jogs.'],
        strength(9), easy(9), long(14), recovery(6), rest]],
      ['Threshold endurance', [easy(7), [10, 'Threshold', '3 × 9 min at threshold effort with 2 min easy jogs.'],
        strength(10), easy(9), long(14, 'Practice fueling on rolling terrain.'), recovery(6), rest]],
      ['10K benchmark · reduced mileage', [easy(6), strides(8), easy(8), easy(8),
        [11, '10K benchmark', 'Race a 10K or time yourself over a measured 10K. Start controlled and aim for even effort. The 11 mi includes easy warm-up and cool-down.'],
        recovery(5), rest]],
      ['Recover and rebuild', [easy(7), strides(9), strength(8), easy(8),
        long(13, 'Keep this aerobic while you recover from the 10K.'), recovery(5), rest]],
      ['Peak week · race-pace rehearsal', [easy(7), strides(10), easy(10), easy(10),
        long(15, 'If recovered, run 2 × 2 mi at your tentative half-marathon pace in the second half with 3 min easy between reps. Practice race fueling. If the reps feel like a race, reset your target pace.'), recovery(6), rest]]
    ]
  },
  {
    id: 'taper', title: 'Taper', weeks: [
      ['Freshen up', [easy(6), [8, 'Half-marathon effort', '2 × 1 mi at planned race effort with a 3 min easy jog.'],
        easy(7), easy(8), long(10), recovery(5), rest]],
      ['Race week · 19 mi before race', [rest,
        [6, 'Race tune-up', '2 × 5 min at planned race effort with a 2 min easy jog.'],
        easy(5), easy(5), [3, 'Shakeout', 'Keep it relaxed.'], rest,
        [13.1, 'United Airlines NYC Half', 'Start controlled and settle into the pace supported by your training.']]]
    ]
  }
];

const milesLabel = miles => `${Number(miles.toFixed(1))} mi`;

renderHalfTraining({
  openingDay: Date.UTC(2026, 10, 18),
  phases,
  summarizeWeek: days => milesLabel(days.reduce((sum, [miles]) => sum + miles, 0)),
  formatAmount: milesLabel
});
