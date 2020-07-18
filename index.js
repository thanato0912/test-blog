const express = require('express');
const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb+srv://sang:roal1223@test-blog.h3jfc.mongodb.net/<dbname>?retryWrites=true&w=majority',
 {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log('DB connected')).catch(err=>console.error(err));




app.get('/', (req, res) => {
  res.send('hello world!');
});



app.listen(5000);
