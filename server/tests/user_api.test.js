const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await helper.addInitialUser()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 1)
  })

  describe('addition of a new user', () => {
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mhakkinen',
        name: 'Mika Häkkinen',
        password: 'maailmanmestari98ja99',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with status code 400 if username already exists', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: helper.initialUser.username,
        name: 'Another root',
        password: 'secret',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(result.body.error, 'expected `username` to be unique')

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with status code 400 if password is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'foobar',
        name: 'Foo Bar',
        password: 'se',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(result.body.error, 'expected `password` to be at least 3 characters long')

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})