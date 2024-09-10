import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, login } = useUser(); // Destructure setUser here
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(email, password);

    console.log('Login Response:', response);

    if (response) {
      const { token, user } = response;

      console.log('User:', user);
      console.log('Token:', token);

      setUser(user); // Correctly set the user state

      if (user.status === 'pending') {
        alert('Your account is pending approval by an Admin');
      }

      navigate('/home');
    } else {
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // Takes the full viewport height
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', // Ensures the form takes full container width
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Box mt={2} width="100%">
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>
      </form>
      <Box mt={2} width="100%">
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate('/register')}
        >
          Register
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
