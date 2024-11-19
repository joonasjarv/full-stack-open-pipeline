import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBlogForm from './CreateBlogForm';

describe('<CreateBlogForm />', () => {
  test('calls createBlog with correct data when form is submitted', async () => {
    const createBlog = vi.fn();
    const newBlog = {
      title: 'Component testing is done with react-testing-library',
      author: 'Test Author',
      url: 'http://test.com',
    };

    render(<CreateBlogForm createBlog={createBlog} />);


    const user = userEvent.setup();

    await user.click(screen.getByText('new blog'));

    await user.type(screen.getByLabelText('title:'), newBlog.title);
    await user.type(screen.getByLabelText('author:'), newBlog.author);
    await user.type(screen.getByLabelText('url:'), newBlog.url);

    await user.click(screen.getByText('create'));

    expect(createBlog.mock.calls).toHaveLength(1);
    expect(createBlog.mock.calls[0][0]).toEqual(newBlog);
  });
});