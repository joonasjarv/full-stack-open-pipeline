
import { useState } from 'react';
import PropTypes from 'prop-types';

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async event => {
    event.preventDefault();

    const success = await login({ username, password });
    if (success) {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="username">username</label>
        <input
          id="username"
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">password</label>
        <input
          id="password"
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
};

LoginForm.propTypes = {
  login: PropTypes.func.isRequired,
};

export default LoginForm;
