const findGameById = (roomId, games) => {
  const game = games.find((game) => {
    return game.gameId === roomId;
  });

  return game !== null ? game : null;
};

module.exports = { findGameById };
