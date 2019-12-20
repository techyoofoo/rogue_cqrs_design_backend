var methods = require('./index');

const userroutes = [
    { method: 'POST', path: '/rouge/user/create', handler: methods.create },
    { method: 'GET', path: '/rouge/user/get', handler: methods.getAll },
    { method: 'PUT', path: '/rouge/user/update/{id}', handler: methods.updateUserById },
    { method: 'DELETE', path: '/rouge/user/delete/{id}', handler: methods.deleteUserById },
    { method: 'GET', path: '/rouge/user/get/{id}', handler: methods.findUserById }
]

module.exports.routes = userroutes