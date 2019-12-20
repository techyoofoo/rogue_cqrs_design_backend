var amqp = require('amqplib/callback_api')

var opts = {
    cert: "",
    key: "",
    passphrase: "",
    ca: ""
}

module.exports = function (cb) {
    amqp.connect('amqp://localhost',
        opts, function (err, conn) {
            if (err) {
                throw new Error(err)
            }
            cb(conn)
        })
}

const channel = async (conn) => {
    return new Promise((resolve, reject) => {
        conn.createChannel(function (err, channel) {
            if (err) {
                throw new Error(err)
            }
            return resolve(channel)
        })
    })
}

module.exports.channel = channel