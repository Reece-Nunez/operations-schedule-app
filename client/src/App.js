import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Schedule from './components/Schedule';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ManageOperators from './components/ManageOperators';
import OperatorDetail from './components/OperatorDetail';
import AdminPanel from './components/AdminPanel';
import { useUser } from './contexts/UserContext';

const App = () => {
  const { isAuthenticated } = useUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/schedule" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute roles={['Clerk', 'OLMC', 'APS', 'Admin']} />}>
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/manage-operators" element={<ManageOperators />} />
        </Route>
        <Route element={<ProtectedRoute roles={['Operator', 'Clerk', 'OLMC', 'APS', 'Admin']} />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Route>
        <Route path="/operator/:id" element={<OperatorDetail />} />
        {/* Add other protected routes here */}
      </Routes>
    </Router>
  );
};

export default App;
