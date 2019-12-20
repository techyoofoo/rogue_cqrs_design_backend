const mongoose = require('mongoose');

const schemaModel = new mongoose.Schema(
    {
        name: {
            type: String
        },
        description: {
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

const RoleSchema = mongoose.model("role", schemaModel);
module.exports.RoleSchema = RoleSchema
