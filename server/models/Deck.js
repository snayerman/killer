const { rankValue, suitValue } = require('../constants/CardValues');
const PlayingCard = require('./PlayingCard');

class Deck {
  constructor(shuffle = true) {
    this.cards = this.initializeDeck();
    shuffle && this.shuffleCards();
  }

  initializeDeck() {
    const ranks = Object.keys(rankValue);
    const suits = Object.keys(suitValue);
    const cards = [];

    ranks.forEach((rank) => {
      suits.forEach((suit) => {
        const card = new PlayingCard(suit, rank);
        cards.push(card);
      });
    });

    return cards;
  }

  addCards(cards) {
    this.cards = this.cards.concat(cards);
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    let hands = [[], [], [], []];

    for (let i = 0; i < this.cards.length - 3; i += 4) {
      hands[0].push(this.cards[i]);
      hands[1].push(this.cards[i + 1]);
      hands[2].push(this.cards[i + 2]);
      hands[3].push(this.cards[i + 3]);
    }

    this.cards = [];

    return hands;
  }
}

module.exports = Deck;
