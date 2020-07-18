const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const {User} = require('./models/user');
const {auth} = require('./middleware/auth');

mongoose.connect(config.mongoURI,
 {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then(()=>console.log('DB connected')).catch(err=>console.error(err));


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // --> json reader
app.use(cookieParser()); //cookie parser for cookie (login)


//Auth
app.get('/api/users/auth', auth, (req, res) => {
  res.status(200).json({
    _id:req._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role
  });
});

//register
app.post('/api/users/register', (req, res) => {
  const user = new User(req.body); /* bodyparser parse all data to fit into the user schema of Mongodb
                                      take a look at the user schema at user.js*/

  user.save((err, doc) => {
    if(err)
      return res.json({success:false, err}); // .json from bodyparser obviously
    res.status(200).json({
      success: true,
      userData: doc
    });
  });

});

//login
app.post('/api/users/login', (req, res) => {
  //search for the email provided from our DB
  User.findOne({email: req.body.email},  (err, user) => {
    if(!user) {
      return res.json({
        loginSucess: false,
        message: "Auth failed, email not found"
      });
    }
    //compare the password given
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch) {
        return res.json({
          loginSucess: false,
          message: "password is incorrect", err
        });
      }else {
        //generate token to maintain the login state
        user.generateToken((err, user)=> {
          if(err) return res.status(400).send(err);
          else {
            return res.cookie("x_auth", user.token).status(200).json({
              loginSuccess: true,
              userData: user
            });
          }
        });
      }
    }); //end of comparePassword

  }); //end of findOne

});

//loggout
app.get('/api/users/logout',auth, (req, res) => {
  User.findOneAndUpdate({_id:req.user._id}, {token: ""}, (err, doc)=>{
    if(err) return res.json({success: false, err});
    else {
      return res.status(200).send({
        sucess:true
      });
    }
  });
});


app.listen(5000);
