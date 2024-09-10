import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Button, List, ListItem, Link as MuiLink, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, Select, MenuItem, FormControl, Typography, InputLabel, 
  Checkbox, ListItemText, Box, IconButton, Grid, Paper
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageOperators = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    letter: '',
    employeeId: '',
    phone: '',
    jobs: [],
    team: '', // Add team field
  });

  const availableJobs = ['FCC Console', 'VRU Console', '#1 Out', '#2 Out', '#3 Out', 'Tank Farm'];
  const teams = ['A', 'B', 'C', 'D', 'Replacement', 'Probationary'];

  useEffect(() => {
    if (['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role)) {
      const token = localStorage.getItem('token');
      if (token) {
        axios.get('/api/operators', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        .then(response => setOperators(response.data))
        .catch(error => console.error('Error fetching operators:', error));
      }
    }
  }, [user]);

  const handleOpen = (operator = null) => {
    if (operator) {
      setSelectedOperator(operator);
      setFormData({
        name: operator.name,
        letter: operator.letter,
        employeeId: operator.employeeId,
        phone: formatPhoneNumber(operator.phone), // Format the phone number
        email: operator.email || '',
        jobs: operator.jobs || [],
        team: operator.team || '', // Populate team
      });
    } else {
      setSelectedOperator(null);
      setFormData({
        name: '',
        letter: '',
        employeeId: '',
        phone: '',
        email: '',
        jobs: [],
        team: '', // Default to empty string
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOperator(null);
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
    setFormData(prevState => ({
      ...prevState,
      phone: formattedPhoneNumber
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.letter || !formData.phone || !formData.employeeId) {
      console.error('All required fields must be filled, including Employee ID.');
      return;
    }
  
    const updatedFormData = { ...formData };
  
    try {
      const token = localStorage.getItem('token');
      let response;
  
      if (selectedOperator && selectedOperator.id) {
        response = await axios.put(`/api/operators/${selectedOperator.id}`, updatedFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOperators(operators.map((op) => (op.id === selectedOperator.id ? response.data : op)));
      } else {
        response = await axios.post('/api/operators', updatedFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOperators([...operators, response.data]);
      }
  
      handleClose();
    } catch (error) {
      console.error('Error saving operator:', error.response?.data?.error || error.message);
    }
  };

  const handleDelete = async (operatorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/operators/${operatorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setOperators(operators.filter(op => op.id !== operatorId));
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleJobChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prevState => ({
      ...prevState,
      jobs: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const groupedOperators = operators.reduce((groups, operator) => {
    const team = operator.team || 'No Team';
    if (!groups[team]) {
      groups[team] = [];
    }
    groups[team].push(operator);
    return groups;
  }, {});

  return (
    <Box 
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      padding="1rem"
    >
      <Button
        variant='outlined'
        color='primary'
        onClick={() => navigate('/')}
        style={{ marginBottom: '1rem' }}
      >
        Back
      </Button>
  
      <Box width="100%" maxWidth="1200px" textAlign="center">
        <Typography variant="h4" gutterBottom>Manage Operators</Typography>
        {['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role) ? (
          <>
            <Grid container spacing={3} justifyContent="center">
              {teams.map((team) => (
                <Grid item xs={12} sm={6} md={4} key={team}>
                  <Paper elevation={3} style={{ padding: '1rem', minHeight: '200px' }}>
                    <Typography variant="h6" gutterBottom>
                      Team {team}
                    </Typography>
                    <List>
                      {groupedOperators[team] ? groupedOperators[team].map((operator) => (
                        <ListItem key={operator.id} style={{ display: 'block', marginBottom: '10px' }}>
                          <Typography variant="body1">
                            <strong>{operator.name} - {operator.letter}</strong>
                          </Typography>
                          <Typography variant="body2">
                            <strong>Phone:</strong> {operator.phone}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Jobs:</strong> {operator.jobs.join(' | ')}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" marginTop="0.5rem">
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpen(operator)}
                            >
                              Edit
                            </Button>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDelete(operator.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      )) : (
                        <Typography variant="body2">No operators in this team</Typography>
                      )}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Add Operator Button */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
              >
                Add Operator
              </Button>
            </Box>
          </>
        ) : (
          <p>You do not have permission to manage operators.</p>
        )}
      </Box>
  
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedOperator ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="letter"
            label="Letter"
            type="text"
            fullWidth
            value={formData.letter}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="employeeId"
            label="Employee ID"
            type="text"
            fullWidth
            value={formData.employeeId}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={handlePhoneChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="jobs-label">Jobs</InputLabel>
            <Select
              labelId="jobs-label"
              multiple
              value={formData.jobs}
              onChange={handleJobChange}
              renderValue={(selected) => selected.join(', ')}
            >
              {availableJobs.map((job) => (
                <MenuItem key={job} value={job}>
                  <Checkbox checked={formData.jobs.indexOf(job) > -1} />
                  <ListItemText primary={job} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="team-label">Team</InputLabel>
            <Select
              labelId="team-label"
              name="team"
              value={formData.team}
              onChange={handleChange}
            >
              {teams.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">{selectedOperator ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageOperators;
