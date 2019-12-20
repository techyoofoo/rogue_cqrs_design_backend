const Hapi = require('@hapi/hapi');
const mongoHost = "localhost:27017";//'127.0.0.1';
const mongoUrl = `mongodb://${mongoHost}/rogue_app`;
const mongoose = require('mongoose');
const config = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(mongoUrl, config);
mongoose.Promise = global.Promise;
const routes = require('./api/route').routes


const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 6003,
        host: process.env.IP || "localhost",
        routes: {
            cors: {
                origin: ["*"],
                headers: ["Accept", "Content-Type"],
                additionalHeaders: ["X-Requested-With"]
            }
        }
    });
    server.route(routes);
    await server.start();
    console.log('User server running on %s', server.info.uri);
};

init();