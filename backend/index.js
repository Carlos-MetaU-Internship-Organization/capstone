const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const config = dotenv.config()

const PORT = process.env.PORT;

const auth = require('./routes/auth');
const search = require('./routes/search')
const listings = require('./routes/listings')
const track = require('./routes/track')
const preferences = require('./routes/preferences')
const messages = require('./routes/messages')
const populate = require('./routes/populate')

let sessionConfig = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.RENDER ? true : false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
}

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(", ");

let corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
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
app.use('/api/populate', populate);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app