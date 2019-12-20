'use strict';
const Hapi = require('@hapi/hapi');
var amqp = require('amqplib/callback_api');

var ch = require('./rabbitmqservice').channel

var rabbitConn = require('./rabbitmqservice');
let connection = null;

rabbitConn(function (conn) {
  connection = conn;
});

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
    port: process.env.PORT || 3002,
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
  console.log('Internal bus listen server running on %s', server.info.uri);



  var schemaModel = new mongoose.Schema({}, { strict: false });
  server.route({
    method: 'GET',
    path: '/api/v1/{event}/{key}',
    handler: function (request, h) {
      return new Promise(async function (resolve, reject) {
        try {
          var channel = await ch(connection)
          var exchange = request.params.event;

          channel.assertExchange(exchange, 'topic', {
            durable: false
          });

          channel.assertQueue('', {
            exclusive: true
          }, function (error2, q) {
            if (error2) {
              throw error2;
            }

            let key = request.params.key;
            channel.bindQueue(q.queue, exchange, key);

            channel.consume(q.queue, function (msg) {
              let payload = msg.content.toString();
              console.log(payload)
              let data = JSON.parse(payload)
              const model = data.UB.header.Event.split('.')[0];
              const Schema = mongoose.model(model, schemaModel);
              mongoose.Promise = global.Promise;
              const schema = new Schema(Object.assign({}, data.UB.data_body));
              const promise = schema.save();
              promise.then(document => {
                let publishdata = {
                  eventId: payload.id,
                  name: data.UB.header.ReportFormatter,
                  collection: document
                }

                channel.assertExchange(data.UB.header.PublicEvent, 'topic', {
                  durable: false
                });
                let publicRoutingKey = `user`;
                channel.publish(exchange, publicRoutingKey, Buffer.from(JSON.stringify(publishdata)));
                //bus.publish(data.UB.header.PublicEvent, { publishdata });
                console.info('store: saved document');
                console.info(document);
                resolve(h.response({ Message: document }));
              });
            }, {
              noAck: true
            });
            return resolve(h.response("OK"));
          });


          //TODO : one time subscription
          // bus.listen(request.params.event, payload => {
          //   const model = payload.payload.UB.header.Event.split('.')[0];
          //   const Schema = mongoose.model(model, schemaModel);
          //   mongoose.Promise = global.Promise;
          //   const schema = new Schema(Object.assign({}, payload.payload.UB.data_body));
          //   const promise = schema.save();
          //   promise.then(document => {
          //     let data = {
          //       eventId: payload.id,
          //       name: payload.payload.UB.header.ReportFormatter,
          //       collection: document
          //     }
          //     bus.publish(payload.payload.UB.header.PublicEvent, { data });
          //     console.info('store: saved document');
          //     console.info(document);
          //     resolve(h.response({ Message: document }));
          //   });
          // });
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


