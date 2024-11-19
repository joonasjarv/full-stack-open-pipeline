const { expect } = require('@playwright/test')

const loginWith = async (page, username, password)  => {
  await page.getByRole('textbox', { name: 'username' }).fill(username)
  await page.getByRole('textbox', { name: 'password' }).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, blog) => {
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByRole('textbox', { name: 'title:' }).fill(blog.title)
  await page.getByRole('textbox', { name: 'author:' }).fill(blog.author)
  await page.getByRole('textbox', { name: 'url:' }).fill(blog.url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByText(`a new blog ${blog.title} by ${blog.author} added`).waitFor()
}

const getBlogDiv = async (page, blog) => {
  const blogTitleSpan = page.getByText(`${blog.title} ${blog.author}`);
  return blogTitleSpan.locator('..').locator('..');
}

const likeBlog = async (page, blog) => {
  const blogDiv = await getBlogDiv(page, blog);
  const viewButton = blogDiv.getByRole('button', { name: 'view' });
  if (await viewButton.isVisible()) {
    await viewButton.click()
  }
  const likeButton = blogDiv.getByRole('button', { name: 'like' });
  await likeButton.click()
}

export { loginWith, createBlog, getBlogDiv, likeBlog };