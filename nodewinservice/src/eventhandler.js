const rabbitUrl = `amqp://localhost`;
const bus = require('servicebus').bus({ url: rabbitUrl });

const eventHandler = async (data) => {
    bus.send(data.name, { data: data.collection });
}

module.exports.eventHandler = eventHandler