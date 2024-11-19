const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    await User.deleteMany({})
    await helper.addInitialUser()
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.initialBlogs.length)
  })

  test('the identifier property of blogs is named id', async () => {
    const blogs = await helper.blogsInDb()

    blogs.forEach(blog => {
      assert(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with a valid blog', async () => {
      const newBlog = {
        title: 'Maailmanmestari',
        author: 'Mika Häkkinen',
        url: 'http://example.com',
        likes: 0
      }

      const user = await api.post('/api/login').send(helper.initialUser)

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()
      const titles = blogs.map(blog => blog.title)

      assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
      assert(titles.includes('Maailmanmestari'))
    })

    test('defaults likes to 0 if not given', async () => {
      const newBlog = {
        title: 'No likes',
        author: 'Foo Bar',
        url: 'http://example.com'
      }

      const user = await api.post('/api/login').send(helper.initialUser)

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()
      const savedBlog = blogs.find(blog => blog.title === newBlog.title)

      assert.strictEqual(savedBlog.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: 'Foo bar',
        url: 'http://example.com',
        likes: 0
      }

      const user = await api.post('/api/login').send(helper.initialUser)

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(400)

      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: 'Foo Bar',
        author: 'Foo Bar',
        likes: 0
      }

      const user = await api.post('/api/login').send(helper.initialUser)

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(400)

      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    test('fails with status code 401 if token is missing', async () => {
      const newBlog = {
        title: 'Maailmanmestari',
        author: 'Mika Häkkinen',
        url: 'http://example.com',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogs = await helper.blogsInDb()
      const titles = blogs.map(blog => blog.title)

      assert.strictEqual(blogs.length, helper.initialBlogs.length)
      assert(!titles.includes('Maailmanmestari'))
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newBlog = {
        title: 'To be deleted',
        author: 'Foo Bar',
        url: 'http://example.com',
      }

      const user = await api.post('/api/login').send(helper.initialUser)
      const blogToDelete = await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(201)

      await api
        .delete(`/api/blogs/${blogToDelete.body.id}`)
        .set('Authorization', `Bearer ${user.body.token}`)
        .expect(204)

      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, blogsAtStart.length)

      const titles = blogs.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updating a blog', () => {
    test('succeeds with valid blog data', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToUpdate = initialBlogs[0]

      const blogWithUpdatedData = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogWithUpdatedData)
        .expect(200)

      const blogs = await helper.blogsInDb()
      const updatedBlog = blogs.find(blog => blog.id === blogToUpdate.id)

      assert.strictEqual(updatedBlog.title, blogWithUpdatedData.title)
      assert.strictEqual(updatedBlog.likes, blogWithUpdatedData.likes)
    })

    test('fails with status code 400 if data is invalid', async () => {
      const initialBlogs = await helper.blogsInDb()
      const blogToUpdate = initialBlogs[0]

      // title is missing
      const invalidBlog = {
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(invalidBlog)
        .expect(400)

      const blogs = await helper.blogsInDb()
      const unchangedBlog = blogs.find(blog => blog.id === blogToUpdate.id)

      assert.strictEqual(unchangedBlog.title, blogToUpdate.title)
      assert.strictEqual(unchangedBlog.likes, blogToUpdate.likes)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const validNonExistingId = await helper.nonExistingId()
  
      const validBlog = {
        title: 'Foo Bar',
        author: 'Foo Bar',
        url: 'http://example.com',
        likes: 0
      }
  
      await api
        .put(`/api/blogs/${validNonExistingId}`)
        .send(validBlog)
        .expect(404)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
