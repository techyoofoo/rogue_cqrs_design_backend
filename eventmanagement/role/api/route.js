var methods = require('./index');

const roleroutes = [
    { method: 'POST', path: '/rouge/role/create', handler: methods.create },
    { method: 'GET', path: '/rouge/role/get', handler: methods.getAll },
    { method: 'PUT', path: '/rouge/role/update/{id}', handler: methods.updateRoleById },
    { method: 'DELETE', path: '/rouge/role/delete/{id}', handler: methods.deleteRoleById },
    { method: 'GET', path: '/rouge/role/get/{id}', handler: methods.findRoleById }
]

module.exports.routes = roleroutes