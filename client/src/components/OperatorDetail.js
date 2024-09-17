    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { useNavigate, useParams } from 'react-router-dom';
    import { Container, Typography, Box, Avatar, Button } from '@mui/material';

    const OperatorDetail = () => {
    const { id } = useParams();
    const [operator, setOperator] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
    
        if (token) {
        axios.get(`/api/operators/${id}`, {
            headers: {
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        })
        .then(response => setOperator(response.data))
        .catch(error => console.error('Error fetching operator details:', error));
        } else {
        console.error('No token found');
        }
    }, [id]);

    if (!operator) {
        return <p>Loading...</p>;
    }

    const handleBack = () => {
        navigate('/');
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Operator Profile
            </Typography>
            <Box mt={2} mb={2} display="flex" alignItems="center">
                <Avatar alt={operator.name} src={operator.avatar} sx={{ width: 56, height: 56 }} />
            </Box>
            <Typography variant="h6" component="h2" gutterBottom>
                {operator.name}
            </Typography>
            <Typography variant="body1">
                <strong>Email:</strong> {operator.email}
            </Typography>
            <Typography variant="body1">
                <strong>Phone Number:</strong> {operator.phone}
            </Typography>
            <Typography variant="body1">
                <strong>Role:</strong> {operator.role}
            </Typography>
            <Typography variant="body1">
                <strong>Status</strong> {operator.status}
            </Typography>
            <Typography variant="body1">
                <strong>Operator Letter:</strong> {operator.letter}
            </Typography>
            <Typography variant="body1" component="h2" gutterBottom>
                <strong>Trained Jobs:</strong>
            </Typography>
            {operator.jobs && operator.jobs.length > 0 ? (
                operator.jobs.map((job, index) => (
                    <Typography key={index} variant='body2'>
                        {job}
                    </Typography>
                ))
            ): (
                <Typography variant='body2'>No jobs assigned</Typography>
            )}
            <div>
                <Button variant='contained'
                    color='primary'
                    onClick={handleBack}
                    sx={{ marginTop: 2}}
                >
                    Back
                </Button>
            </div>
        </Container>
    );
};

    export default OperatorDetail;
