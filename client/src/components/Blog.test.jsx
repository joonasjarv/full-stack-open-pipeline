import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';

describe('<Blog />', () => {
  let container;
  let likeBlog;

  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 10,
    user: { name: 'Test User' }
  };

  beforeEach(() => {
    likeBlog = vi.fn();
    container = render(<Blog blog={blog} likeBlog={likeBlog} />).container;
  });

  test('renders only its title and author by default', () => {
    screen.getByText(`${blog.title} ${blog.author}`);
    expect(screen.queryByText(blog.url)).not.toBeInTheDocument();
    expect(screen.queryByText(`likes ${blog.likes}`)).not.toBeInTheDocument();
    expect(screen.queryByText(blog.user.name)).not.toBeInTheDocument();
  });

  test('after clicking the view button, all fields are rendered', async () => {
    const user = userEvent.setup();
    const button = screen.getByText('view');
    await user.click(button);

    screen.getByText(`${blog.title} ${blog.author}`);
    screen.getByText(blog.url);
    screen.getByText(`likes ${blog.likes}`);
    screen.getByText(blog.user.name);
  });

  test('calls likeBlog twice when like button is clicked twice', async () => {
    const user = userEvent.setup();

    const viewButton = screen.getByText('view');
    await user.click(viewButton);

    const likeButton = screen.getByText('like');
    await user.click(likeButton);
    await user.click(likeButton);

    expect(likeBlog.mock.calls).toHaveLength(2);
  });
});