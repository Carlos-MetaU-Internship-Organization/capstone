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
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.RENDER ? true : false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
}

const allowedOrigins = ['http://localhost:5173'];

let corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

app.use(cors(corsOptions));
app.use(session(sessionConfig))
app.use(express.json());

app.use('/api/auth', auth);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app