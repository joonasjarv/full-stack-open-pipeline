import axios from 'axios';
const baseUrl = '/api/blogs';

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const create = async blog => {
  const response = await axios.post(baseUrl, blog, { headers: { Authorization: token } });
  return response.data;
};

const update = async (id, blog) => {
  const response = await axios.put(`${baseUrl}/${id}`, blog);
  return response.data;
};

const remove = async id => {
  const response = await axios.delete(`${baseUrl}/${id}`, { headers: { Authorization: token } });
  return response.data;
};

export default { getAll, setToken, create, update, remove };