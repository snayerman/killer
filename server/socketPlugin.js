const fastifyPlugin = require('fastify-plugin');
const SocketIOServer = require('socket.io');

const fastifySocketIo = (fastify, options, next) => {
  try {
    const io = new SocketIOServer(fastify.server, options);
    fastify.decorate('io', io);
    next();
  } catch (err) {
    next(error);
  }
};

module.exports = fastifyPlugin(fastifySocketIo, {
  name: 'fastify-socket.io',
});
