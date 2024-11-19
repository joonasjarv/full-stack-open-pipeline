const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  return blogs.reduce((previous, current) => {
    return current.likes > previous.likes ? current : previous;
  }, blogs[0]);
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const blogCountByAuthor = _.countBy(blogs, 'author');
  const authors = _.keys(blogCountByAuthor);
  const authorWithMostBlogs = _.maxBy(authors, (author) => blogCountByAuthor[author]);

  return {
    author: authorWithMostBlogs,
    blogs: blogCountByAuthor[authorWithMostBlogs]
  };
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const blogsByAuthor = _.groupBy(blogs, 'author');
  const likesByAuthor = _.mapValues(blogsByAuthor, (blogs) => _.sumBy(blogs, 'likes'));
  const authors = _.keys(likesByAuthor);
  const authorWithMostLikes = _.maxBy(authors, (author) => likesByAuthor[author]);

  return {
    author: authorWithMostLikes,
    likes: likesByAuthor[authorWithMostLikes]
  };
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}