const Joi = require('joi');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const configs = require("../startup/config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  email_id: {
    type: String,
    match: /.+\@.+\..+/,
    unique: true,
    required: true
  },
  drones: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  missions: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  sites: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  categories:{
    type: [mongoose.Schema.Types.ObjectId]
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email
    },
    configs.jwtPrivateKey
  );
  return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
    email_id: Joi.string().min(3).email()
  });

  return schema.validate(user);
}

exports.validate = validateUser;
exports.User = User;
exports.userSchema = userSchema;