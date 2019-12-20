var UserSchema = require('./model').UserSchema

const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            UserSchema.find({ email: request.payload.email }).then(result => {
                if (result.length !== 0) {
                    return resolve(reply.response({ Message: "User already exist" }).code(200));
                }
                else {
                    request.payload.roleid = !request.payload.roleid ? "5dc278e9b0e3cc2e8898d4b6" : request.payload.roleid
                    const user = new UserSchema(request.payload)
                    user
                        .save()
                        .then(data => {
                            return resolve(reply.response({ Message: "User created successfully" }).code(201));
                        })
                        .catch(err => {
                            console.log(err.message)
                            return resolve(reply.response(err.message).code(500));
                        });

                }
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

const getAll = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            UserSchema.find({}).then(result => {
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

const updateUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(UserInfo => {
                    return resolve(reply.response({ Message: `${UserInfo.firstname} Updated Successfully` }).code(200));
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


const deleteUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.deleteOne({ _id: request.params.id })
                .then(UserInfo => {
                    if (UserInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
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

const findUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.findById({ _id: request.params.id })
                .then(UserInfo => {
                    return resolve(reply.response(UserInfo).code(200));
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
    updateUserById: updateUserById,
    deleteUserById: deleteUserById,
    findUserById: findUserById
}











