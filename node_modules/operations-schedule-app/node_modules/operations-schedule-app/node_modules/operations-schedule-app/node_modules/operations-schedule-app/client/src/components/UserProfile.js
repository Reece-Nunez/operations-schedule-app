import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { TextField, Button, Container, Typography, Box, Avatar, Grid } from '@mui/material';
import axios from 'axios';

const defaultAvatars = [
'/avatars/default1.png',
'/avatars/default2.png',
'/avatars/default3.png',
// Add more paths to your default avatars here
];

const UserProfile = () => {
const { user, setUser } = useUser();
const [id, setId] = useState(user?.id || '');
const [name, setName] = useState(user?.name || '');
const [email, setEmail] = useState(user?.email || '');
const [phone, setPhone] = useState(user?.phone || '');
const [password, setPassword] = useState('');
const [avatar, setAvatar] = useState(user?.avatar || '');

useEffect(() => {
    if (user) {
    setId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setAvatar(user.avatar);
    }
}, [user]);

const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
    const response = await axios.put('/api/profile', { id, name, email, phone, password, avatar });
    setUser(response.data);
    alert('Profile updated successfully!');
    } catch (error) {
    console.error('Profile update error:', error);
    alert('Failed to update profile. Please try again.');
    }
};

const handleAvatarUpload = async (e) => {
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);

    try {
    const response = await axios.post('/api/profile/avatar', formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });
    setUser(response.data);
    alert('Avatar uploaded successfully!');
    } catch (error) {
    console.error('Avatar upload error:', error);
    alert('Failed to upload avatar. Please try again.');
    }
};

const handleDefaultAvatarSelect = (avatar) => {
    setAvatar(avatar);
};

return (
    <Container maxWidth="sm">
    <Typography variant="h4" component="h1" gutterBottom>
        User Profile
    </Typography>
    <Box mt={2} mb={2} display="flex" alignItems="center">
        <Avatar alt={name} src={avatar} sx={{ width: 56, height: 56 }} />
        <Button variant="outlined" component="label" sx={{ ml: 2 }}>
        Change Avatar
        <input type="file" hidden onChange={handleAvatarUpload} />
        </Button>
    </Box>

    <Typography variant="h6" component="h2" gutterBottom>
        Choose a Default Avatar
    </Typography>
    <Grid container spacing={2}>
        {defaultAvatars.map((avatarPath) => (
        <Grid item xs={4} key={avatarPath}>
            <Avatar
            src={avatarPath}
            sx={{ width: 56, height: 56, cursor: 'pointer', border: avatar === avatarPath ? '2px solid blue' : 'none' }}
            onClick={() => handleDefaultAvatarSelect(avatarPath)}
            />
        </Grid>
        ))}
    </Grid>

    <form onSubmit={handleProfileUpdate}>
        <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        />
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
        label="Phone"
        fullWidth
        margin="normal"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
        label="New Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
        <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
            Update Profile
        </Button>
        </Box>
    </form>
    </Container>
);
};

export default UserProfile;
