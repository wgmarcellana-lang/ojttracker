const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;

const clampMinZero = (value) => Math.max(0, roundToTwo(value));

module.exports = {
  roundToTwo,
  clampMinZero
};
