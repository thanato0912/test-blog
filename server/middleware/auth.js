const {User} = require('../models/user');

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  User.findByToken(token, (err, userData) => {
    if(err) throw err;
    if(!userData) {
      return res.json({
        isAuth: false,
        error: true
      });
    }else {
      req.token = token;
      req.user = userData;
      next();
    }
  });
};

module.exports = {auth};
