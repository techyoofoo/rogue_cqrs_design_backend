'use strict';
const uuid = require('uuid');
const Hapi = require('@hapi/hapi');

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
const events = {
    create: 'messages.create',
};
const rabbitHost = RABBITMQ_HOST || '127.0.0.1';
const rabbitPort = RABBITMQ_PORT || '15672';
const rabbitUrl = RABBITMQ_URL || `amqp://${rabbitHost}:${rabbitPort}`;
const bus = require('servicebus').bus({ url: rabbitUrl });
//console.log("rabbitUrl", rabbitUrl);

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.start();
    console.log('Message command server running on %s', server.info.uri);

    server.route({
        method: 'POST',
        path: '/api/v1/messages',
        handler: function (request, h) {

            const payload = request.payload;
            const id = uuid.v4();
            const message = payload;
            return new Promise(function (resolve, reject) {
                try {
                    bus.send(events.create, { id, message });
                    console.log("Event id -", id);
                    resolve(h.response({ Message: `Event id - ${id}` }));
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
