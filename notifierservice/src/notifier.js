const Hapi = require('hapi');
const rabbitUrl = `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });


var EventEmitter = require('events');
var notifier = new EventEmitter();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3004,
    host: process.env.IP || "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type"],
        additionalHeaders: ["X-Requested-With"]
      }
    }
  });

  const socketServer = new Hapi.server({
    port: process.env.PORT || 3005,
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

  await socketServer.start();
  console.log("Server running on %s", socketServer.info.uri);

  var io = require('socket.io')(socketServer.listener);

  bus.subscribe("public_bus", async function (payload) {
    notifier.emit('event', payload.data);
  });

  io.on('connection', function (socket) {
    console.log("Connection succeed")
    notifier.on('event', function (data) {
      socket.emit(data.eventId, data.collection);
    });
  });

  server.route({
    method: "GET",
    path: "/notifier/{name}",
    handler: function (request, reply) {
      const promise = new Promise(async (resolve, reject) => {
        try {
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


