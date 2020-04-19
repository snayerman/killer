import suites from '../constants/suites';

const getSuitColor = (suit) => {
  return suit === suites.h || suit === suites.d ? 'red' : 'black';
};

export default getSuitColor;
