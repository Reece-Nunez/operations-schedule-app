    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { useParams } from 'react-router-dom';
    import { Container, Typography, Box, Avatar, Grid } from '@mui/material';

    const OperatorDetail = () => {
    const { id } = useParams();
    const [operator, setOperator] = useState(null);

    useEffect(() => {
        axios.get(`/api/operators/${id}`)
        .then(response => setOperator(response.data))
        .catch(error => console.error('Error fetching operator details:', error));
    }, [id]);

    if (!operator) {
        return <p>Loading...</p>;
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
            Email: {operator.email}
        </Typography>
        <Typography variant="body1">
            Phone: {operator.phone}
        </Typography>
        <Typography variant="body1">
            Role: {operator.role}
        </Typography>
        <Typography variant="body1">
            Status: {operator.status}
        </Typography>
        <Typography variant="body1">
            Operator Letter: {operator.letter}
        </Typography>
        </Container>
    );
};

    export default OperatorDetail;
