import { useState } from 'react';
import PropTypes from 'prop-types';

const CreateBlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleCreateBlog = async event => {
    event.preventDefault();
    const newBlog = {
      title,
      author,
      url
    };
    const success = await createBlog(newBlog);
    if (success) {
      setTitle('');
      setAuthor('');
      setUrl('');
      setIsVisible(false);
    }
  };

  const handleToggleVisibility = () => {
    if (isVisible) {
      setTitle('');
      setAuthor('');
      setUrl('');
    }
    setIsVisible(!isVisible);
  };

  return (
    <>
      {
        isVisible &&
        <form onSubmit={handleCreateBlog}>
          <div>
            <label htmlFor="title">title:</label>
            <input
              type="text"
              id="title"
              value={title}
              name="Title"
              onChange={({ target }) => setTitle(target.value)}
            />
          </div>
          <div>
            <label htmlFor="author">author:</label>
            <input
              type="text"
              id="author"
              value={author}
              name="Author"
              onChange={({ target }) => setAuthor(target.value)}
            />
          </div>
          <div>
            <label htmlFor="url">url:</label>
            <input
              type="text"
              id="url"
              value={url}
              name="Url"
              onChange={({ target }) => setUrl(target.value)}
            />
          </div>
          <button type="submit">create</button>
        </form>
      }
      <button onClick={handleToggleVisibility}>
        {isVisible ? 'cancel' : 'new blog'}
      </button>
    </>
  );
};

CreateBlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
};

export default CreateBlogForm;