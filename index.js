const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const {User} = require('./models/user');

mongoose.connect(config.mongoURI,
 {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log('DB connected')).catch(err=>console.error(err));


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // --> json reader
app.use(cookieParser()); //cookie parser for cookie (login)


app.post('/api/users/register', (req, res)=> {
  const user = new User(req.body); /* bodyparser parse all data to fit into the user schema of Mongodb
                                      take a look at the user schema at user.js*/
  user.save((err, userData) => {
    if(err)
      return res.json({success:false, err}); // .json from bodyparser obviously

    return res.status(200).json({
      success: true
    });
  });

});



app.listen(5000);
