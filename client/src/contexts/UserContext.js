// src/contexts/UserContext.js
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.status === 200) {
        const { user, token } = response.data;
        setUser(user); // Update user state
        localStorage.setItem('token', token); // Store the token
        return { user, token }; // Return both user and token
      }
    } catch (error) {
      console.error('Login error:', error);
      return null; // Return null on failure
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = () => !!user;

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
