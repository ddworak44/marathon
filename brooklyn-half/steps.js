(() => {
  const steps = document.getElementById('walk-steps');
  const miles = document.getElementById('walk-miles');
  const stepsPerMile = document.getElementById('steps-per-mile');
  const result = document.getElementById('step-result');
  const number = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 });
  let source = steps;

  function convert() {
    const fromSteps = source === steps;
    const target = fromSteps ? miles : steps;
    const amount = source.valueAsNumber;
    const ratio = stepsPerMile.valueAsNumber;
    const estimate = fromSteps ? amount / ratio : amount * ratio;
    const converted = fromSteps ? Number(estimate.toPrecision(3)) : Math.round(estimate);
    if (!source.validity.valid || !stepsPerMile.validity.valid || !Number.isFinite(converted)) {
      target.value = '';
      result.textContent = 'Enter a valid amount and a positive step count per mile.';
      return;
    }
    target.value = converted;
    result.textContent = `${number.format(steps.valueAsNumber)} steps ≈ ${number.format(miles.valueAsNumber)} mi`;
  }

  for (const input of [steps, miles]) {
    input.addEventListener('input', () => {
      source = input;
      convert();
    });
  }
  stepsPerMile.addEventListener('input', convert);
  convert();
})();
