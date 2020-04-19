const { rankValue, suitValue } = require('../constants/CardValues');

class PlayingCard {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = rankValue[rank] * 4 + suitValue[suit];
    this.faceUp = true;
    this.selected = false;
  }

  flip() {
    this.faceUp = !this.faceUp;
  }
}

module.exports = PlayingCard;
