const Game = require('./models/Game');
const { findGameById } = require('./helpers/games');

const log = console.log;
console.log = (msg) => log(`${msg}\n`);

const fastify = require('fastify')({
  logger: true,
});

fastify.register(require('./routes'));
fastify.register(require('./socketPlugin'));

const start = async () => {
  try {
    await fastify.listen(3000);
    const io = fastify.io;
    const games = [];

    // TODO: Make it so when player leaves, sets internal connected status to false
    // but keeps record of player so they or someone else can rejoin and have the same cards
    const leaveGame = (socket, player, gameId, games) => {
      const { id, name } = player;
      const game = findGameById(gameId, games);

      if (game && game.getPlayerById(id)) {
        console.log(`Player ${name} left the game`);
        game.removePlayer(id);

        //TODO: Check if no players left, delete game from games

        updateGame(socket, game, false);
      }
    };

    const updateGame = (socket, game, sendToSender = true) => {
      sendToSender && socket.emit('update_game', game);
      socket.broadcast.emit('update_game', game);
    };

    const addPlayer = (game, player) => {
      const playerId = player.id || game.players.length + 1;
      game.addPlayer(player.name, playerId);

      const gamePlayer = game.getPlayerById(playerId);
      return { player: gamePlayer, game };
    };

    io.on('connection', (socket) => {
      let user;
      console.log('client connected!');

      socket.on('disconnect', () => {
        console.log('client disconnected!');

        if (!!user && user.game && user.player) {
          console.log(`Disconnecting ${user.player.name}`);

          leaveGame(socket, user.player, user.game.gameId, games);
        }
      });

      socket.on('create_game', ({ connection, player }) => {
        const { roomId } = connection;

        // If game room already exists, emit error
        if (findGameById(roomId, games)) {
          socket.emit('error_event', {
            type: 'LOCAL_ROOM',
            message: `Room ${roomId} already exists!`,
          });
        } else {
          console.log(`Game with id ${roomId} created!`);
          const game = new Game(roomId, null, false);

          // add player to game and store client player and game data in user
          user = addPlayer(game, player);

          // add game to array of games
          games.push(game);

          // let sender know they joined room
          socket.emit('room_joined', { game, player: user.player });
        }
      });

      socket.on('join_room', ({ connection, player }) => {
        const { roomId } = connection;
        const game = findGameById(roomId, games);

        if (!game) {
          console.log(`Room ${roomId} doesn't exist!`);

          socket.emit('error_event', {
            type: 'LOCAL_ROOM',
            message: `Room ${roomId} doesn't exist!`,
          });
        } else if (
          game &&
          game.players.length === 4 &&
          !game.getPlayerById(player.id)
        ) {
          // 4 people in game already
          socket.emit('error_event', {
            type: 'GAME',
            message: 'Unable to join, game lobby is full!',
          });
        } else {
          // add player to game and store client player and game data in user
          user = addPlayer(game, player);

          // let other players know another player joined
          socket.broadcast.emit('someone_joined_room', game);

          // let sender know they joined room
          socket.emit('room_joined', { game, player: user.player });

          // Start game once 4th person joins
          if (game.players.length === 4) {
            game.start();
            updateGame(socket, game);
          }
        }
      });

      socket.on('click_card', ({ gameId, playerId, card }) => {
        try {
          const game = findGameById(gameId, games);
          const player = game.getPlayerById(playerId);
          const gameCard = player.hand.find((cardInHand) => {
            return cardInHand.value === card.value;
          });

          gameCard.selected
            ? player.deselectCard(gameCard)
            : player.selectCard(gameCard);

          updateGame(socket, game);
          // TODO check if card selected in selectedCards also selected in hand
        } catch (err) {
          if (!player) {
            socket.emit('error_event', {
              type: 'GAME',
              message: 'Invalid operation!',
            });
          }
        }
      });

      socket.on('leave_room', ({ connection, player }) => {
        leaveGame(socket, player, connection.roomId, games);
      });
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
