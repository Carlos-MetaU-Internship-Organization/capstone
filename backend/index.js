const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3000 //TODO: put in env

const auth = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
});

module.exports = app