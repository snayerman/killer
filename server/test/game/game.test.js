const Game = require('../../models/Game');

describe('Game', () => {
  let game, p1, p2, p3, p4;
  let gameId, deck, playedCards, players, started, round, allMoves, options;

  const updateFields = () => {
    ({
      gameId,
      deck,
      playedCards,
      players,
      started,
      round,
      allMoves,
      options,
    } = game);
  };

  const checkPlayersCardLengths = (players, handLen, selectedCardsLen) => {
    players.forEach((player) => {
      expect(player.hand.length).toEqual(handLen);
      expect(player.selectedCards.length).toEqual(selectedCardsLen);
    });
  };

  const checkPlayerCardLengths = (player, handLen, selectedCardsLen) => {
    expect(player.hand.length).toEqual(handLen);
    expect(player.selectedCards.length).toEqual(selectedCardsLen);
  };

  beforeAll(() => {
    game = new Game('test', null, false);

    game.addPlayer('Sam', 1);
    game.addPlayer('Henry', 2);
    game.addPlayer('Kian', 3);
    game.addPlayer('Bdo', 4);

    p1 = game.getPlayerById(1);
    p2 = game.getPlayerById(2);
    p3 = game.getPlayerById(3);
    p4 = game.getPlayerById(4);

    updateFields();
  });

  afterEach(() => {
    updateFields();
  });

  test('game initalized properly', () => {
    expect(gameId).toEqual('test');
    expect(deck.cards.length).toBe(52);
    expect(playedCards.length).toBe(0);
    expect(players.length).toBe(4);
    expect(started).toBe(false);
    expect(round).toMatchObject({
      count: 0,
      currentPlayer: null,
      playersPassed: [],
      moves: [],
    });
    expect(allMoves.length).toBe(0);
  });

  test('players initialized properly', () => {
    [p1, p2, p3, p4].forEach((player, idx) => {
      const gamePlayer = game.players[idx];

      expect(player.name).toEqual(gamePlayer.name);
      expect(player.id).toEqual(gamePlayer.id);
      expect(gamePlayer.hand.length).toEqual(0);
      expect(gamePlayer.selectedCards.length).toEqual(0);
    });
  });

  test('starts properly', () => {
    game.start();
    updateFields();

    expect(started).toBeTruthy();
    expect(deck.cards.length).toBe(0);
    expect(round).toMatchObject({
      count: 1,
      currentPlayer: p1.id,
      playersPassed: [],
      moves: [],
    });

    checkPlayersCardLengths(players, 13, 0);
  });

  describe('simulate round', () => {
    describe('single turn, each player plays 3 card straights', () => {
      test('select 3 card straight for all players', () => {
        p1.selectCards(p1.hand.slice(1, 4));
        p2.selectCards(p2.hand.slice(1, 4));
        p3.selectCards(p3.hand.slice(1, 4));
        p4.selectCards(p4.hand.slice(1, 4));

        updateFields();

        checkPlayersCardLengths(players, 13, 3);
        expect(round.moves.length).toBe(0);
      });

      test('p1 make valid move (straight)', () => {
        game.makeMove(p1.id);
        updateFields();

        checkPlayerCardLengths(p1, 10, 0);
        expect(round.count).toBe(1);
        expect(round.currentPlayer).toBe(p2.id);
        expect(round.moves.length).toBe(1);
        expect(allMoves.length).toBe(0);
      });

      test('p2 make valid move (straight)', () => {
        game.makeMove(p2.id);
        updateFields();

        checkPlayerCardLengths(p2, 10, 0);
        expect(round.count).toBe(1);
        expect(round.currentPlayer).toBe(p3.id);
        expect(round.moves.length).toBe(2);
        expect(allMoves.length).toBe(0);
      });

      test('p3 make valid move (straight)', () => {
        game.makeMove(p3.id);
        updateFields();

        checkPlayerCardLengths(p3, 10, 0);
        expect(round.count).toBe(1);
        expect(round.currentPlayer).toBe(p4.id);
        expect(round.moves.length).toBe(3);
        expect(allMoves.length).toBe(0);
      });

      test('p4 make valid move (straight)', () => {
        game.makeMove(p4.id);
        updateFields();

        checkPlayerCardLengths(p4, 10, 0);
        expect(round.count).toBe(1);
        expect(round.currentPlayer).toBe(p1.id);
        expect(round.moves.length).toBe(4);
        expect(allMoves.length).toBe(0);
      });

      test('pass until p4 and start new trend - play 2H', () => {
        game.makeMove(p1.id, true);
        game.makeMove(p2.id, true);
        game.makeMove(p3.id, true);
        updateFields();

        expect(playedCards.length).toBe(12);
        expect(round.currentPlayer).toEqual(p4.id);
        expect(round.playersPassed).toEqual(
          expect.arrayContaining([p1.id, p2.id, p3.id])
        );

        p4.selectCards(p4.hand.slice(0, 1));
        game.makeMove(p4.id);
        updateFields();

        expect(round.count).toBe(2);
        expect(round.currentPlayer).toEqual(p1.id);
        expect(round.playersPassed.length).toBe(0);
        expect(round.moves.length).toBe(1);
      });
    });
  });

  describe('simulate round where all pass and last player continues trend', () => {
    beforeAll(() => {
      game = new Game('test', { continueWhenAllPassed: true }, false);

      game.addPlayer('Sam', 1);
      game.addPlayer('Henry', 2);
      game.addPlayer('Kian', 3);
      game.addPlayer('Bdo', 4);

      p1 = game.getPlayerById(1);
      p2 = game.getPlayerById(2);
      p3 = game.getPlayerById(3);
      p4 = game.getPlayerById(4);

      game.start();

      p1.selectCards(p1.hand.slice(1, 4));
      game.makeMove(p1.id);
      game.makeMove(p2.id, true);
      game.makeMove(p3.id, true);
      game.makeMove(p4.id, true);

      updateFields();
    });

    test('check continueWhenAllPassed is true', () => {
      expect(options.continueWhenAllPassed).toBeTruthy();
      expect(round.count).toBe(1);
      expect(round.moves.length).toBe(4);
      expect(round.currentPlayer).toBe(1);
    });

    test('p1 playing higher straight keeps game in round 1', () => {
      p1.selectCards(p1.hand.slice(1, 4));
      game.makeMove(p1.id);
      updateFields();

      expect(round.currentPlayer).toBe(1);
      expect(round.count).toBe(1);
      expect(round.moves.length).toBe(5);
    });

    test('p1 playing new pattern starts new round', () => {
      p1.selectCards(p1.hand.slice(0, 1));
      game.makeMove(p1.id);
      updateFields();

      expect(round.currentPlayer).toBe(2);
      expect(round.count).toBe(2);
      expect(round.moves.length).toBe(1);
    });

    test('resetting game sets field back to default', () => {
      game.resetGame(false);
      updateFields();

      expect(gameId).toEqual('test');
      expect(deck.cards.length).toBe(52);
      expect(playedCards.length).toBe(0);
      expect(players.length).toBe(4);
      expect(started).toBe(false);
      expect(round).toMatchObject({
        count: 0,
        currentPlayer: null,
        playersPassed: [],
        moves: [],
      });
      expect(allMoves.length).toBe(0);
    });
  });
});
