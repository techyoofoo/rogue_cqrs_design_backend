'use strict';
const uuid = require('uuid');
const Hapi = require('@hapi/hapi');
const axios = require('axios');

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
            axios.get("http://localhost:3002/api/v1/" + event)
            .catch(error => {
                throw error
            });
            return new Promise(function (resolve, reject) {
                try {
                    bus.send(event, { id, payload });
                    console.log("Event id -", id);
                    return resolve(h.response({ Message: `Event id - ${id}` }));
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
