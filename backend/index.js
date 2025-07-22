const express = require('express')
const session = require('express-session')
const { RedisStore } = require('connect-redis')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const config = dotenv.config()

const redisClient = require('./cache/redisClient')

const PORT = process.env.PORT;

const auth = require('./routes/auth');
const listings = require('./routes/listings')
const makeModels = require('./routes/makeModels')
const messages = require('./routes/messages')
const populate = require('./routes/populate')
const searchFilters = require('./routes/searchFilters')
const track = require('./routes/track')
const user = require('./routes/user')

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(", ");

let sessionConfig = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: isProduction ? 'none' : 'lax',
    domain: isProduction ? process.env.BACKEND_DOMAIN : undefined 
  },
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:'
  }),
}

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

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(session(sessionConfig))
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', auth);
app.use('/api/listings', listings);
app.use('/api/makeModels', makeModels);
app.use('/api/messages', messages);
app.use('/api/populate', populate);
app.use('/api/searchFilters', searchFilters);
app.use('/api/track', track);
app.use('/api/user', user);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app