const { moves } = require('../helpers/moveValidator');

class Move {
  constructor(cards, playerId, type, length = 0) {
    this.cards = cards;
    this.playerId = playerId;
    this.type = type;
    this.length = length;
  }

  beatsMove(prevMoves) {
    // First move in round
    if (prevMoves.length === 0) return true;

    let moveIdx = prevMoves.length - 1;
    let move = prevMoves[moveIdx];

    while (move.type === moves.PASS) {
      // All previous moves were passes, therefore first move in round
      if (moveIdx - 1 < 0) return true;

      // Find the last non-pass move
      moveIdx--;
      move = prevMoves[moveIdx];
    }

    const beatsMoveNonBomb =
      this.type === move.type &&
      this.length === move.length &&
      this.cards[this.cards.length - 1].value >
        move.cards[move.cards.length - 1].value;

    const bombOverTwo =
      (this.type === moves.BOMB_PAIRS || this.type === moves.BOMB_QUAD) &&
      move.type === moves.SINGLE &&
      move.rank === '2';

    // move types and length must be the same
    // last card must have higher value
    return beatsMoveNonBomb || bombOverTwo;
  }
}

module.exports = Move;
