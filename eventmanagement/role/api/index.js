var RoleSchema = require('./model').RoleSchema

const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            RoleSchema.find({
                name: request.payload.name,
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: "Role already exist" }).code(200));
                else {
                    const createRole = new RoleSchema(request.payload);
                    createRole
                        .save()
                        .then(data => {
                            return resolve(reply.response({ Message: "Role created successfully" }).code(201));
                        })
                        .catch(err => {
                            console.log(err.message)
                            return resolve(reply.response(err.message).code(500));
                        });
                }
            }).catch(err => {
                console.log(err.message)
                return resolve(reply.response(err.message).code(500));
            });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}

const getAll = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            RoleSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                console.log(err.message)
                return resolve(reply.response(err.message).code(500));
            })
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}

const updateRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(RoleInfo => {
                    return resolve(reply.response({ Message: `${RoleInfo.name} Updated Successfully` }).code(200));
                })
                .catch(err => {
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}

const deleteRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.deleteOne({ _id: request.params.id })
                .then(RoleInfo => {
                    if (RoleInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}

const findRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.findById({ _id: request.params.id })
                .then(RoleInfo => {
                    return resolve(reply.response(RoleInfo).code(200));
                })
                .catch(err => {
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}


module.exports = {
    create: create,
    getAll: getAll,
    updateRoleById: updateRoleById,
    deleteRoleById: deleteRoleById,
    findRoleById: findRoleById
}











