

const mongoose = require('mongoose');
const RegisterSchema = new mongoose.Schema({

    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  });
  
  const Register = mongoose.model('Register', RegisterSchema);
  
  module.exports = Register;