const Deck = require('./Deck');
const Player = require('./Player');
const Move = require('./Move');
const suits = require('../constants/suits');
const { moves } = require('../helpers/moveValidator');

class Game {
  constructor(gameId, options = null, shuffle = true) {
    this.gameId = gameId;
    this.deck = new Deck(shuffle);
    this.playedCards = [];
    this.players = [];
    this.started = false;
    this.round = {
      count: 0,
      currentPlayer: null,
      playersPassed: [],
      moves: [],
    };
    this.allMoves = [];
    this.options = options || {
      continueWhenAllPassed: false,
    };
  }

  addPlayer(name, id) {
    const player = this.getPlayerById(id);

    if (player && player.name === name) {
      player.connect();
    } else {
      this.players.push(new Player(name, id));
    }
  }

  removePlayer(id) {
    const player = this.getPlayerById(id);
    player.disconnect();
  }

  /**
   *
   * @param {String} id - playerId
   * @returns {Player} player
   */
  getPlayerById(id, list = this.players) {
    return list.find((player) => player.id === id);
  }

  getIndexOfPlayerInList(id, list = this.players) {
    return list.findIndex((player) => player.id === id);
  }

  hasPlayerPassed(id) {
    return this.round.playersPassed.includes(id);
  }

  determineStartingPlayer() {
    for (let player of this.players) {
      const cards = player.hand;
      const threeOfSpades = cards.find((card) => {
        return card.suit === suits.SPADE && card.rank === '3';
      });

      if (threeOfSpades !== undefined) {
        return player.id;
      }
    }
  }

  dealCards() {
    // this removes the cards from the deck
    const hands = this.deck.deal();

    this.players.forEach((player, idx) => {
      player.addCards(hands[idx]);
    });
  }

  getNextPlayer(playerIndex) {
    return playerIndex === this.players.length - 1
      ? this.players[0]
      : this.players[playerIndex + 1];
  }

  incrementTurn() {
    const playerId = this.round.currentPlayer;
    const indexOfPlayer = this.getIndexOfPlayerInList(playerId);

    let nextPlayer = this.getNextPlayer(indexOfPlayer);
    let indexOfNextPlayer = this.getIndexOfPlayerInList(nextPlayer.id);

    while (this.hasPlayerPassed(nextPlayer.id)) {
      nextPlayer = this.getNextPlayer(indexOfNextPlayer);
      indexOfNextPlayer = this.getIndexOfPlayerInList(
        nextPlayer.id,
        this.players
      );
    }

    this.round.currentPlayer = nextPlayer.id;
  }

  makeMove(playerId, pass = false) {
    const player = this.getPlayerById(playerId);
    const proposedMove = player.getProposedMove(pass);
    const { playersPassed } = this.round;
    const { continueWhenAllPassed } = this.options;
    let lastPlayerLeft =
      !playersPassed.includes(playerId) && playersPassed.length === 3;

    if (playerId === this.round.currentPlayer) {
      // When everyone has passed and its last remaining players turn,
      // start a new round if option to continue trend when everyone else
      // has already passed
      if (lastPlayerLeft && !continueWhenAllPassed) {
        this.newRound(playerId);
        lastPlayerLeft = false;
      }

      if (!proposedMove.type !== moves.INVALID) {
        const move = new Move(
          player.selectedCards,
          playerId,
          proposedMove.type,
          proposedMove.length
        );

        const passMove = move.type === moves.PASS;
        const nonPassMove = !passMove;
        let beatsLastMove = move.beatsMove(this.round.moves);

        // In the case where continueAllPassed is true and the last player left
        // is starting a new trend - start a new round
        if (lastPlayerLeft && continueWhenAllPassed && !beatsLastMove) {
          this.newRound(playerId);
          beatsLastMove = move.beatsMove(this.round.moves);
          lastPlayerLeft = false;
        }

        // Current move doesn't beat last move
        if (nonPassMove && !beatsLastMove) {
          console.error(`${player.name}'s move doesn't beat the last move`);
          return;
        }

        // Add player to list of passed players in current round
        // TODO: if continueWhenAllPassed and last player passes, start new round and
        // make it that players turn
        if (passMove) this.round.playersPassed.push(move.playerId);

        // Add the cards played to the played cards pile if a non pass move
        if (nonPassMove && beatsLastMove)
          this.playedCards = this.playedCards.concat(player.playCards());

        // Add the move to the list of moves and increment turn
        if (passMove || (nonPassMove && beatsLastMove)) {
          this.round.moves.push(move);
          this.incrementTurn();
        }
      }
    } else if (
      proposedMove.type === moves.BOMB_PAIRS ||
      proposedMove.type === moves.BOMB_QUAD
    ) {
      // bomb logic
    } else {
      console.error('Not your turn!');
    }
  }

  resetGame(shuffle = true) {
    // Add all cards back to deck
    this.deck.addCards(this.playedCards);
    this.playedCards = [];

    this.players.forEach((player) => {
      player.updateSelectedCards(false);

      this.deck.addCards(player.hand);
      player.hand = [];
      player.selectedCards = [];
    });

    shuffle && this.deck.shuffleCards();

    // reset state of game
    this.started = false;

    // reset allMoves
    this.allMoves = [];

    // reset round
    this.round.count = 0;
    this.round.currentPlayer = null;
    this.round.playersPassed = [];
    this.round.moves = [];
  }

  getGame() {
    return this;
  }

  newRound(prevRoundWinner = null) {
    this.round.count++;
    this.round.currentPlayer =
      prevRoundWinner || this.determineStartingPlayer();
    this.round.playersPassed = [];

    this.allMoves = this.allMoves.concat(this.round.moves);
    this.round.moves = [];
  }

  start() {
    if (/* this.players.length !== 4 || */ this.started) {
      console.error('Cant start game!');
      return;
    }

    this.dealCards();
    this.newRound();
    this.started = true;
  }
}

module.exports = Game;
