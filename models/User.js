const mongoose = require('mongoose');

// this is the schema we are going to use to create user model 
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

// here we create the model using UserSchema whose name will be user
module.exports = User = mongoose.model('user', UserSchema);