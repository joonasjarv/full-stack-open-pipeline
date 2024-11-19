const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog, getBlogDiv, likeBlog } = require('./helper');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'secret'
      }
    });
    await request.post('/api/users', {
      data: {
        name: 'Test User 2',
        username: 'testuser2',
        password: 'secret'
      }
    });

    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText('log in to application');
    await expect(locator).toBeVisible();
    const usernameField = page.getByRole('textbox', { name: 'username' });
    const passwordField = page.getByRole('textbox', { name: 'password' });
    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'secret');
      const locator = page.getByText('Test User logged in');
      await expect(locator).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrong');
      const locator = page.getByText('invalid username or password');
      await expect(locator).toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'secret');
    });

    test('a new blog can be created', async ({ page }) => {
      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://example.com',
      };
      await createBlog(page, newBlog);
      const blogList = page.getByTestId('blog-list');
      await expect(blogList).toContainText(newBlog.title);
    });

    test('a blog can be liked', async ({ page }) => {
      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://example.com',
      };
      await createBlog(page, newBlog);
      await likeBlog(page, newBlog);
      const blogDiv = await getBlogDiv(page, newBlog);
      await expect(blogDiv).toContainText('likes 1');
    });

    test('a blog can be deleted', async ({ page }) => {
      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://example.com',
      };

      page.on('dialog', async dialog => {
        expect(dialog.message()).toBe(`Remove blog ${newBlog.title} by ${newBlog.author} ?`);
        await dialog.accept();
      });

      await createBlog(page, newBlog);

      const blogDiv = await getBlogDiv(page, newBlog);
      const viewButton = blogDiv.getByRole('button', { name: 'view' });
      await viewButton.click();
      const removeButton = blogDiv.getByRole('button', { name: 'remove' });
      await removeButton.click();

      await expect(blogDiv).not.toBeVisible();
    });

    test('the blog delete button is rendered only for the blog creator', async ({ page }) => {
      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://example.com',
      };
      await createBlog(page, newBlog);

      const blogDiv = await getBlogDiv(page, newBlog);
      const viewButton = blogDiv.getByRole('button', { name: 'view' });
      await viewButton.click();
      const removeButton = blogDiv.getByRole('button', { name: 'remove' });
      await expect(removeButton).toBeVisible();

      await page.getByRole('button', { name: 'logout' }).click();
      await loginWith(page, 'testuser2', 'secret');

      await viewButton.click();
      await expect(removeButton).not.toBeVisible();
    });

    test('blogs are sorted by number of likes', async ({ page }) => {
      const blogs = [
        {
          title: 'Test Blog 1',
          author: 'Test Author 1',
          url: 'http://example.com',
        },
        {
          title: 'Test Blog 2',
          author: 'Test Author 2',
          url: 'http://example.com',
        },
        {
          title: 'Test Blog 3',
          author: 'Test Author 3',
          url: 'http://example.com',
        }
      ];
      const blogTitlesInInitialOrder = blogs.map(blog => `${blog.title} ${blog.author}`);
      const blogTitlesInFinalOrder = blogTitlesInInitialOrder.toReversed();

      for (const blog of blogs) {
        await createBlog(page, blog);
      }

      const blogDivs = await Promise.all(blogs.map(blog => getBlogDiv(page, blog)));

      const blogTitlesBeforeLikes = await page
        .getByTestId('blog-list')
        .locator('> div')
        .allTextContents();
      blogTitlesInInitialOrder.forEach((title, index) => {
        expect(blogTitlesBeforeLikes[index]).toContain(title);
      });

      await likeBlog(page, blogs[2]);
      await expect(blogDivs[2]).toContainText('likes 1');
      await likeBlog(page, blogs[2]);
      await expect(blogDivs[2]).toContainText('likes 2');
      await likeBlog(page, blogs[1]);
      await expect(blogDivs[1]).toContainText('likes 1');

      const blogTitlesAfterLikes = await page
        .getByTestId('blog-list')
        .locator('> div')
        .allTextContents();
      blogTitlesInFinalOrder.forEach((title, index) => {
        expect(blogTitlesAfterLikes[index]).toContain(title);
      });
    });
  });
});