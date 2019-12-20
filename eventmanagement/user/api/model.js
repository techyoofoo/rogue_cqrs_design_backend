const mongoose = require('mongoose');

const schemaModel = new mongoose.Schema(
    {
        firstname: {
            type: String
        },
        lastname: {
            type: String
        },
        email: {
            type: String
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        },
        password: {
            type: String
        },
        username: {
            type: String
        },
        mobileno: {
            type: String
        },
        usertype: {
            type: String,
            enum: ["ANONYMOUS", "CUSTOMER"],
            default: "ANONYMOUS"
        },
        roleid: {
            type: String
        },
        companyname: {
            type: String
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true
        },
        timestamps: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
    , { strict: false });

const UserSchema = mongoose.model("user", schemaModel);
module.exports.UserSchema = UserSchema
