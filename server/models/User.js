const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({

    username:{
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contact:{
        type: Number
    },
    image:{
        type: String,
        default: 'to be added'
    },
    isActive:{
        type: Boolean,
        default: false
    },
    followers:{
        type: Schema.Types.Array,
        prefixItems: [
            {type: Schema.Types.ObjectId}
        ]
    },
    following:{
        type: Schema.Types.Array,
        prefixItems: [
            {type: Schema.Types.ObjectId}
        ]
    }

}, {timestamps: true});