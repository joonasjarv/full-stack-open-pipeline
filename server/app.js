const express = require('express')
const path = require('path');
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan');
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

app.use(express.static(path.join(__dirname, 'dist')));

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl)
  .then(()=>{
    console.log("Connected to the database");
  })
  .catch(err => {
    console.log("Error connecting to the database", err);
  });

app.use(cors())
app.use(express.json())

morgan.token('request-body', (request) => JSON.stringify(request.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'));

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.get('/health', (req, res) => {
  res.send('ok')
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
