'use strict';
const Hapi = require('@hapi/hapi');

/**
 * environment variables
 */

const {
  MONGODB_HOST,
  MONGODB_URL,
  RABBITMQ_HOST,
  RABBITMQ_PORT,
  RABBITMQ_URL,
  MESSAGE_STORE_PORT,
  PORT,
} = process.env;

/**
 * mongodb connection
 */
const mongoHost = MONGODB_HOST || "localhost:27017";//'127.0.0.1';
const mongoUrl = MONGODB_URL || `mongodb://${mongoHost}/messages`;
//const options = { useMongoClient: true };
const mongoose = require('mongoose');
const config = { useNewUrlParser: true,useUnifiedTopology: true }
mongoose.connect(mongoUrl, config);

/**
 * rambbitmq connection
 */

const rabbitHost = RABBITMQ_HOST || '127.0.0.1';
const rabbitPort = RABBITMQ_PORT || '15672';
const rabbitUrl = RABBITMQ_URL || `amqp://${rabbitHost}:${rabbitPort}`;
const bus = require('servicebus').bus({ url: rabbitUrl });

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost'
  });

  await server.start();
  console.log('Read-focus sServer running on %s', server.info.uri);

  const messageSchema = new mongoose.Schema({
    id: String,
    message: {
      content: String,
    },
  },
    {
      strict: false,
    }
  );

  const Message = mongoose.model('Message', messageSchema);

  const events = {
    create: 'messages.create',
    create_public_bus: 'messages.public_bus',
  };

  mongoose.Promise = global.Promise;
  bus.listen(events.create, payload => {
    const message = new Message(Object.assign({}, payload));
    const promise = message.save();
    promise.then(document => {
      bus.send(events.create_public_bus, { document });
      console.info('store: saved document');
      console.info(document);
    });
  });

};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();


