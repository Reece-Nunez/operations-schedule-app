// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Schedule from './components/Schedule';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute roles={['Clerk', 'OLMC', 'APS']} />}>
          <Route path="/schedule" element={<Schedule />} />
        </Route>
        {/* Add more protected routes here */}
      </Routes>
    </Router>
  );
};

export default App;
