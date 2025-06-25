const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()
const PORT = 3000 //TODO: put in env

const auth = require('./routes/auth');

let sessionConfig = {
  name: 'sessionId',
  secret: 'keep it secret, keep it safe',
  cookie: {
    maxAge: 1000 * 60 * 5,
    secure: process.env.RENDER ? true : false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
}

app.use(session(sessionConfig))
app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app