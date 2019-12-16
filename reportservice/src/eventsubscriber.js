const Hapi = require('hapi');
// var EventLogger = require('node-windows').EventLogger;
const rabbitUrl = `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });
var eventHandler = require('./eventhandler').eventHandler

const init = async () => {
  const server = Hapi.server({
    port: 3003,
    host: 'localhost'
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
  //   var log = new EventLogger('Hello World');
  //   log.info('Basic information.');
  //   log.warn('Watch out!');
  //   log.error('Something went wrong.');

  bus.subscribe("public_bus", async function (payload) {
    let data = await eventHandler(payload.data)
  });

  server.route({
    method: "GET",
    path: "/",
    handler: function (request, h) {
      return h.response("Welcome to windows service application").code(200)
    }
  });
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();


