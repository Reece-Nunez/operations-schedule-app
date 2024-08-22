import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, MenuItem, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const Register = () => {
const [id, setId] = useState('');
const [name, setName] = useState('');
const [letter, setLetter] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [role, setRole] = useState('Operator');
const [phone, setPhone] = useState('');
const navigate = useNavigate();

// State variables for password validation
const [hasMinLength, setHasMinLength] = useState(false);
const [hasUpperCase, setHasUpperCase] = useState(false);
const [hasNumber, setHasNumber] = useState(false);
const [hasSpecialChar, setHasSpecialChar] = useState(false);

const validatePassword = (password) => {
    setHasMinLength(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[@$!%*?&]/.test(password));
};

const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
};

const formatPhoneNumber = (value) => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, ''); // Remove all non-digit characters

    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedPhoneNumber);
};

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
    alert('Please ensure the password meets all requirements.');
    return;
    }

    if (role === 'Operator' && !letter ) {
        alert('The letter field is required for the Operator role.');
        return;
    }

    try {
    const response = await axios.post('/api/register', { id, name, letter, email, password, role, phone });
    if (response.status === 201) {
        alert('Registration successful! Please log in.');
        navigate('/login'); // Redirect to login after successful registration
    }
    } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
    }
};

return (
    <Container maxWidth="sm">
    <Typography variant="h4" component="h1" gutterBottom>
        Register
    </Typography>
    <form onSubmit={handleSubmit}>
        <TextField
        label="Employee ID"
        fullWidth
        margin="normal"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
        />
        <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        />
        <TextField
        select
        label="Role"
        fullWidth
        margin="normal"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
        >
        <MenuItem value="Operator">Operator</MenuItem>
        <MenuItem value="OLMC">OLMC</MenuItem>
        <MenuItem value="Clerk">Clerk</MenuItem>
        <MenuItem value="APS">APS</MenuItem>
        </TextField>
        {role === 'Operator' && (
            <TextField
            label="Operator Letter"
            fullWidth
            margin="normal"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            required={role === 'Operator'}
            />
        )}
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
        label="Phone Number"
        type="tel"
        fullWidth
        margin="normal"
        value={phone}
        onChange={handlePhoneChange}
        required
        />
        <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={handlePasswordChange}
        required
        />
        <List>
        <ListItem>
            <ListItemIcon>
            {hasMinLength ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least 8 characters long" />
        </ListItem>
        <ListItem>
            <ListItemIcon>
            {hasUpperCase ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one uppercase letter" />
        </ListItem>
        <ListItem>
            <ListItemIcon>
            {hasNumber ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one number" />
        </ListItem>
        <ListItem>
            <ListItemIcon>
            {hasSpecialChar ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            </ListItemIcon>
            <ListItemText primary="At least one special character (@$!%*?&)" />
        </ListItem>
        </List>
        
        <Box mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
            Register
        </Button>
        </Box>
    </form>
    <Box mt={2}>
        <Button
        variant="outlined"
        color="secondary"
        fullWidth
        onClick={() => navigate('/login')} // Navigate back to login page
        >
        Back to Login
        </Button>
    </Box>
    </Container>
);
};

export default Register;
