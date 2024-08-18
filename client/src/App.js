// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Schedule from './components/Schedule';
import ProtectedRoute from './components/ProtectedRoute';
import { useUser } from './contexts/UserContext';

const App = () => {
  const { isAuthenticated } = useUser();

  return (
    <Router>
      <Routes>
        {/* Default route redirects to Login */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/schedule" /> : <Login />}
        />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute roles={['Clerk', 'OLMC', 'APS']} />}>
          <Route path="/schedule" element={<Schedule />} />
        </Route>
        <Route element={<ProtectedRoute roles={['Operator', 'Clerk', 'OLMC', 'APS']} />}>
          <Route path="/home" element={<Home />} />
        </Route>
        {/* Add other protected routes here */}
      </Routes>
    </Router>
  );
};

export default App;
