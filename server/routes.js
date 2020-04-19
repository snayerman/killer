const routes = async (fastify, options) => {
  fastify.get('/', async (req, res) => {
    return { hello: 'world' };
  });
};

module.exports = routes;
