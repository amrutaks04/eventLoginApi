const mongoose = require('mongoose');

const RegisterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verificationToken: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    }
});

const Register = mongoose.model('Register', RegisterSchema);

module.exports = Register;
