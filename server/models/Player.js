const { sortHighToLow, sortLowToHigh } = require('../helpers/sortCards');
const { getMoveType } = require('../helpers/moveValidator');

class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.hand = [];
    this.selectedCards = [];
    this.connected = false;
  }

  connect() {
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
  }

  addCards(cards) {
    this.hand = this.hand.concat(cards);
  }

  removeCardsFromHand(cards) {
    // Gets the value of each card to remove and stores it in array
    const values = cards.reduce((cardsArr, card) => {
      return cardsArr.concat([card.value]);
    }, []);

    this.hand = this.hand.filter((card) => {
      return !values.includes(card.value);
    });
  }

  sortLowToHigh() {
    sortLowToHigh(this.hand);
  }

  sortHighToLow() {
    sortHighToLow(this.hand);
  }

  updateSelectedCards(status) {
    this.selectedCards.forEach((card) => {
      card.selected = status;
    });
  }

  selectCards(cards) {
    this.selectedCards = cards;
    this.updateSelectedCards(true);
  }

  selectCard(card) {
    card.selected = true;
    this.selectedCards.push(card);
  }

  deselectCard(card) {
    card.selected = false;

    this.selectedCards = this.selectedCards.filter((selectedCard) => {
      return selectedCard.value !== card.value;
    });
  }

  playCards() {
    const playedCards = [...this.selectedCards];
    this.updateSelectedCards(false);
    this.selectedCards = [];
    this.removeCardsFromHand(playedCards);

    return playedCards;
  }

  getProposedMove(pass) {
    return getMoveType(sortLowToHigh([...this.selectedCards]), pass);
  }
}

module.exports = Player;
