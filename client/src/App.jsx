import { useState, useEffect } from 'react';
import Blog from './components/Blog';
import blogService from './services/blogs';
import loginService from './services/login';
import LoginForm from './components/LoginForm';
import Notification from './components/Notification';
import CreateBlogForm from './components/CreateBlogForm';

const localStorageKey = 'loggedBloglistUser';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(localStorageKey);
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  useEffect(() => {
    const getBlogs = async () => {
      try {
        const blogs = await blogService.getAll();
        setBlogs(blogs);
      } catch ({ response }) {
        showErrorMessage(response.data.error);
      }
    };

    if (user) getBlogs();
  }, [user]);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem(localStorageKey, JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      return true;
    } catch ({ response }) {
      showErrorMessage(response.data.error);
      return false;
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(localStorageKey);
    setUser(null);
    setBlogs([]);
  };

  const handleCreateBlog = async (newBlog) => {
    try {
      const blog = await blogService.create(newBlog);
      setBlogs(blogs.concat(blog));
      showSuccessMessage(`a new blog ${blog.title} by ${blog.author} added`);
      return true;
    } catch ({ response }) {
      showErrorMessage(response.data.error);
      return false;
    }
  };

  const handleLikeBlog = async (blog) => {
    try {
      const updatedBlog = await blogService.update(
        blog.id,
        { ...blog, likes: blog.likes + 1 }
      );
      setBlogs(blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b));
    } catch ({ response }) {
      showErrorMessage(response.data.error);
    }
  };

  const handleDeleteBlog = async (blog) => {
    const confirm = window.confirm(`Remove blog ${blog.title} by ${blog.author} ?`);
    if (!confirm) return;

    try {
      await blogService.remove(blog.id);
      setBlogs(blogs.filter(b => b.id !== blog.id));
    } catch ({ response }) {
      showErrorMessage(response.data.error);
    }
  };

  const userHasCreatedBlog = (blog) => blog.user.username === user.username;

  const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);

  return (
    <div>
      <Notification message={successMessage} type="success" />
      <Notification message={errorMessage} type="error" />

      {
        !user &&
        <>
          <h2>Log in to application</h2>
          <LoginForm login={handleLogin} />
        </>
      }

      {
        user &&
        <>
          <h2>blogs</h2>
          <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>

          <h2>create new</h2>
          <CreateBlogForm createBlog={handleCreateBlog} />

          <div data-testid="blog-list">
            {sortedBlogs.map(blog =>
              <Blog
                key={blog.id}
                blog={blog}
                likeBlog={handleLikeBlog}
                deleteBlog={userHasCreatedBlog(blog) ? handleDeleteBlog : null}
              />
            )}
          </div>
        </>
      }
    </div>
  );
};

export default App;