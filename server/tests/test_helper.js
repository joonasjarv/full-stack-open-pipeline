const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 7,
  }  
]

const initialUser = {
  username: 'root',
  password: 'secret'
}

const nonExistingId = async () => {
  const blog = new Blog({ 
    title: 'Foo',
    author: 'Bar',
    url: 'https://example.com',
    likes: 0
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const addInitialUser = async () => {
  const passwordHash = await bcrypt.hash(initialUser.password, 10)
  const user = new User({ username: initialUser.username, passwordHash })
  await user.save()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  initialUser,
  nonExistingId,
  blogsInDb,
  usersInDb,
  addInitialUser
}