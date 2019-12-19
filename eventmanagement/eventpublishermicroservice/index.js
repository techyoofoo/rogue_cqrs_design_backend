'use strict';
const uuid = require('uuid');
const Hapi = require('@hapi/hapi');
const axios = require('axios');
var amqp = require('amqplib/callback_api');

var ch = require('../rabbitmqservice/service').channel

var rabbitConn = require('../rabbitmqservice/service');
let connection = null;

rabbitConn(function (conn) {
    connection = conn;
});

const {
    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_URL,
    MESSAGE_COMMAND_PORT,
    PORT,
} = process.env;
/**
 * rabbitmq
 */

const rabbitHost = RABBITMQ_HOST || '127.0.0.1';
const rabbitPort = RABBITMQ_PORT || '15672';
const rabbitUrl = RABBITMQ_URL || `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });
//console.log("rabbitUrl", rabbitUrl);

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3001,
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
    console.log('Message command server running on %s', server.info.uri);

    server.route({
        method: 'POST',
        path: '/api/v1/genericlist',
        handler: function (request, h) {
            const payload = request.payload;
            const id = uuid.v4();
            const event = payload.UB.header.Event;
            const key = payload.UB.header.Key ;

            return new Promise(async function (resolve, reject) {
                try {
                    axios.get(`http://localhost:3002/api/v1/${event}/${key}`) //
                        .then(async (response) => {
                            var channel = await ch(connection)
                            var exchange = event;
                            var msg = JSON.stringify(payload);

                            channel.assertExchange(exchange, 'topic', {
                                durable: false
                            });
                            channel.publish(exchange, key, Buffer.from(msg));
                            console.log("Event id -", id);
                            return resolve(h.response({ EventId: id }));
                        })
                        .catch(error => {
                            throw error
                        });

                    //bus.send(event, { id, payload });//send to exchange
                    // console.log("Event id -", id);
                    // return resolve(h.response({ EventId: id }));
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
