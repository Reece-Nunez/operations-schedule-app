// src/components/Logout.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
};

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
