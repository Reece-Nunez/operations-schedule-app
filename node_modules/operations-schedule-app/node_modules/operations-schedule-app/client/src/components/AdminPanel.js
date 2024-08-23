import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@mui/material';

const AdminPanel = () => {
const { user } = useUser();

if (!user || !['Clerk', 'OLMC', 'APS'].includes(user.role)) {
    return null; // Hide the component if the user doesn't have the correct role
}

return (
    <div>
    <h2>Admin Panel</h2>
    <Button variant="contained" color="primary">
        Manage Operators
    </Button>
    {/* Other admin controls */}
    </div>
);
};

export default AdminPanel;
