const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { user } = request
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const { title, author, url, likes } = request.body
  if (!title || !url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  const blogWithUser = await Blog
    .findById(savedBlog._id)
    .populate('user', { username: 1, name: 1 })
  response.status(201).json(blogWithUser)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { user } = request
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  } else if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).end()
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  if (!title || !url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = {
    title,
    author,
    url,
    likes
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { username: 1, name: 1 })

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

module.exports = blogsRouter;
