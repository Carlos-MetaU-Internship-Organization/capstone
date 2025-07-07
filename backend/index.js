const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()
const PORT = 3000 // TODO: put in env

const auth = require('./routes/auth');
const search = require('./routes/search')
const listings = require('./routes/listings')
const track = require('./routes/track')
const preferences = require('./routes/preferences')
const messages = require('./routes/messages')

let sessionConfig = {
  name: 'sessionId',
  secret: 'keep it secret, keep it safe', // TODO: put in env 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.RENDER ? true : false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
}

const allowedOrigins = ['http://localhost:5173']; // TODO: change on deployment

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
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', auth);
app.use('/api/search', search);
app.use('/api/listings', listings);
app.use('/api/track', track);
app.use('/api/preferences', preferences);
app.use('/api/messages', messages);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app