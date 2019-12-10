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
const mongoUrl = MONGODB_URL || `mongodb://${mongoHost}/rogue_app`;
//const options = { useMongoClient: true };
const mongoose = require('mongoose');
const config = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(mongoUrl, config);

/**
 * rambbitmq connection
 */

const rabbitHost = RABBITMQ_HOST || '127.0.0.1';
const rabbitPort = RABBITMQ_PORT || '15672';
const rabbitUrl = RABBITMQ_URL || `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost'
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);

  var schemaModel = new mongoose.Schema({}, { strict: false });
  server.route({
    method: 'GET',
    path: '/api/v1/{event}',
    handler: function (request, h) {
      return new Promise(function (resolve, reject) {
        try {
          bus.listen(request.params.event, payload => {
            const model = payload.payload.UB.header.Event.split('.')[0];
            const Schema = mongoose.model(model, schemaModel);
            mongoose.Promise = global.Promise;
            const schema = new Schema(Object.assign({}, payload.payload.UB.data_body));
            const promise = schema.save();
            promise.then(document => {
              bus.send(payload.payload.UB.header.PublicEvent, { document });
              console.info('store: saved document');
              console.info(document);
              resolve(h.response({ Message: document }));
            });
          });
        }
        catch (err) {
          reject(err);
        }
      })
    }
  });
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();


