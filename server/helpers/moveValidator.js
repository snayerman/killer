const { rankValue } = require('../constants/CardValues');

const moves = {
  SINGLE: 'SINGLE',
  PAIR: 'PAIR',
  TRIPLE: 'TRIPLE',
  STRAIGHT: 'STRAIGHT',
  BOMB_QUAD: 'BOMB_QUAD',
  BOMB_PAIRS: 'BOMB_PAIRS',
  INVALID: 'INVALID',
  PASS: 'PASS',
};

const isStraight = (cards) => {
  for (let i = 0; i < cards.length - 1; i++) {
    const currentCard = cards[i];
    const nextCard = cards[i + 1];

    if (rankValue[nextCard.rank] - rankValue[currentCard.rank] !== 1)
      return false;
  }

  return cards.length >= 3;
};

const allCardsSame = (cards) => {
  const firstCardRank = cards[0].rank;

  for (let i = 1; i < cards.length; i++) {
    if (cards[i].rank !== firstCardRank) return false;
  }

  return true;
};

const isBomb = (cards) => {
  if (cards.length === 4 && allCardsSame(cards)) return true;

  if (cards.length === 6) {
    const consecutive = isStraight([cards[0], cards[2], cards[4]]);
    const pairs =
      allCardsSame([cards[0], cards[1]]) &&
      allCardsSame([cards[2], cards[3]]) &&
      allCardsSame([cards[4], cards[5]]);

    if (consecutive && pairs) return true;
  }

  return false;
};

const getMoveType = (cards, pass = false) => {
  const move = {
    type: moves.INVALID,
    length: 0,
  };

  if (pass) {
    move.type = moves.PASS;
  } else if (cards.length === 1) {
    move.type = moves.SINGLE;
  } else if (cards.length === 2 && allCardsSame(cards)) {
    move.type = moves.PAIR;
  } else if (isStraight(cards)) {
    move.type = moves.STRAIGHT;
    move.length = cards.length;
  } else if (cards.length === 3 && allCardsSame(cards)) {
    move.type = moves.TRIPLE;
  } else if (cards.length === 4 && isBomb(cards)) {
    move.type = moves.BOMB_QUAD;
  } else if (cards.length === 6 && isBomb(cards)) {
    move.type = moves.BOMB_PAIRS;
  }

  return move;
};

module.exports = { getMoveType, moves };
