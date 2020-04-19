const sortLowToHigh = (cards) => {
  return cards.sort((a, b) => {
    return a.value - b.value;
  });
};

const sortHighToLow = (cards) => {
  return cards.sort((a, b) => {
    return b.value - a.value;
  });
};

module.exports = { sortLowToHigh, sortHighToLow };
