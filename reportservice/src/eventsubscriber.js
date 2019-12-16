const Hapi = require('hapi');
// var EventLogger = require('node-windows').EventLogger;
const rabbitUrl = `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });
var eventHandler = require('./eventhandler').eventHandler

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3003,
    host: process.env.IP || "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type"],
        additionalHeaders: ["X-Requested-With"]
      }
    }
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
    path: "/report/{name}",
    handler: function (request, reply) {
      const promise = new Promise(async (resolve, reject) => {
        try {
          bus.listen(request.params.name, { durable: true}, function (event) {
            return resolve(reply.response(event));
          });
          //return resolve(reply.response(data));
        }
        catch (error) {
          throw error
        }
      });
      return promise;
    }
  });
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();


