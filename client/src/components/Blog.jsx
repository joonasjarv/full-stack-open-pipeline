import { useState } from 'react';
import PropTypes from 'prop-types';

const Blog = ({ blog, likeBlog, deleteBlog }) => {
  const blogStyle = {
    padding: 10,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  };

  const [isViewing, setIsViewing] = useState(false);

  return (
    <div style={blogStyle}>
      <div>
        <span>{blog.title} {blog.author}</span>{' '}
        <button onClick={() => setIsViewing(!isViewing)}>
          {isViewing ? 'hide' : 'view'}
        </button>
      </div>
      {
        isViewing &&
        <>
          <div>
            {blog.url}
          </div>
          <div>
            likes {blog.likes}{' '}
            <button onClick={() => likeBlog(blog)}>like</button>
          </div>
          <div>
            {blog.user.name}
          </div>
          {
            deleteBlog &&
            <button onClick={() => deleteBlog(blog)}>remove</button>
          }
        </>
      }
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  likeBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func
};

export default Blog;