const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(cors())
app.use(express.static('public'))

// Mount body-parser middleware
app.use(bodyParser.urlencoded({ extended: false } ));

// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define mongoose schema for user records
const Schema = mongoose.Schema;
const userSchema = new Schema ({
  username: {
    type: String, required: true
  }
});

// Define mongoose model for user records
let User = mongoose.model("User", userSchema);

// Render root path file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Handle POST requests to create new user:
//  initialize New user model
//  save to db
//  return username and _id
app.post('/api/users', (req, res) => {

  let username = req.body.username

  let user = new User({
    username: username
  })

  user.save((saveErr, userSaved) => {
    if (saveErr) {
      console.log('save() error');
      console.error(saveErr);
    }
    res.json({
      "username": userSaved.username,
      "_id": userSaved._id
    });

  }); // user.save() block
}); // new user post block

// Handle GET requests to /api/users
//  display list of all users
//  format will be an array of object literals
app.get('/api/users', (req,res) => {
  User.find((findErr, usersFound) => {
    if (findErr) {
      console.log('User.find() error');
      console.error(findErr);
    }
    res.json(usersFound);
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
