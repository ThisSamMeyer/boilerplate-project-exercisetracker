const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));

// Mount body-parser middleware
app.use(bodyParser.urlencoded({ extended: false } ));

// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define mongoose schema for user records
const Schema = mongoose.Schema;
const userSchema = new Schema ({
  username: {
    type: String,
    required: true
  },
  logs: {
    type: Array,
    default: []
  },
  newExercise: {
    type: Object
  }
});

// Define mongoose model for user records
let User = mongoose.model("User", userSchema);

// Render root path file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Handle POST requests to /api/users:
//  initialize New user model
//  save to db
//  return username and _id
app.post('/api/users', (req, res) => {
  let username = req.body.username;
  let user = new User({
    username: username
  });
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
}); // POST new user block


// Handle GET requests to /api/users
//  display list of all users
//  format will be an array of object literals
app.get('/api/users', (req, res) => {
  let userList = [];
  User.find((findErr, usersFound) => {
    if (findErr) {
      console.log('User.find() error');
      console.error(findErr);
    }
    usersFound.forEach(user => {
      userList.push({
        _id: user._id,
        username: user.username
      })
    })
    res.json(userList);
  });
});

// Handle POST requests to /api/users/:_id/exercises
//  find user in db by _id
//  update user exercise array with new exercise object:
//    description: string
//    duration: number
//    date: date string (current date if field is blank)
//  return updated user object
app.post('/api/users/:_id/exercises', (req, res) => {

  let {description: description, duration: duration, date: date} = req.body;
  let id = req.params._id;

  duration = Number(duration);

  if (!date) {
    date = new Date().toDateString();
  } else {
    date = new Date(date.replaceAll('-', ',')).toDateString()
  }

  let addExercise = {description, duration, date}

  User.findOneAndUpdate(
    {_id: id},
    {"$push": {logs: addExercise}, newExercise: addExercise},
    {new: true},
    (findAndUpdateErr, updatedUser) => {
      if (findAndUpdateErr) {
        console.log('findOneAndUpdate() error');
        console.error(findAndUpdateErr);
      }
      res.json({
        "username": updatedUser.username,
        "_id": updatedUser._id,
        "description": updatedUser.newExercise.description,
        "duration": updatedUser.newExercise.duration,
        "date": updatedUser.newExercise.date
      })
    }
  );
});

// Handle GET requests to /api/users/:_id/exercises
app.get('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  User.findById(id, (findByIdErr, userFound) => {
    if (findByIdErr) {
      console.log("findById() error");
      console.error(findByIdErr);
    }
    res.json(userFound.logs);
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
