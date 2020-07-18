const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const config = require('../config/key');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  token : {
    type:String
  },
  tokenExp: {
    type: Number
  }
});

//encrypting password

userSchema.pre('save', function(next)  { //pre means before saving.. do smt
  var user = this; //this -> userSchema
  if(user.isModified('password')) {// triger this only when we modify pw
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if(err) return next(err); //->next means not doing anything within pre() and proceed to save() with err
      bcrypt.hash(user.password, salt, function(err, hash) {//err if something went wrong and hash if success
        if(err) return next(err);
        user.password = hash;
        next();
      });
    });
  }else {
    next();// put in a seperate else bc of callback functions' asynchronous movement
  }
});

userSchema.methods.comparePassword = function(plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
    if(err) return cb(err);
    return cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function(cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), config.tokenSecret);
  user.token = token;
  user.save(function (err, userData) { //user is different
    if(err) cb(err);
    else cb(null, userData);
  });
};

userSchema.statics.findByToken = function(token, cb) {
  var user = this;
  jwt.verify(token, config.tokenSecret, function(err, decode) {
    if(err) cb(err);
    else {
      user.findOne({"_id":decode, "token":token}, function(err, userInfo) {
        if(err)cb(err);
        else cb(null, userInfo);
      });
    }
  });
}

const User = mongoose.model('User', userSchema);

module.exports = {User};
