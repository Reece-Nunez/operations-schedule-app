import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import {
  Button, List, ListItem, Link as MuiLink,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, Box, IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the delete icon

const ManageOperators = () => {
  const { user } = useUser();
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    letter: '',
    employeeId: '',
    phone: '',
    jobs: [],
  });

  const availableJobs = ['FCC Console', 'VRU Console', '#1 Out', '#2 Out', '#3 Out', 'Tank Farm'];

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
      // Editing existing operator
      setSelectedOperator(operator);
      setFormData({
        name: operator.name,
        letter: operator.letter,
        employeeId: operator.employeeId,
        phone: operator.phone,
        jobs: operator.jobs || [],
      });
    } else {
      // Adding a new operator
      setSelectedOperator(null);
      setFormData({
        name: '',
        letter: '',
        employeeId: '',
        phone: '',
        jobs: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOperator(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.letter || !formData.phone) {
      console.error('All required fields must be filled.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (selectedOperator) {
        const response = await axios.put(`/api/operators/${selectedOperator.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setOperators(operators.map(op => (op.id === selectedOperator.id ? response.data : op)));
      } else {
        const response = await axios.post('/api/operators', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
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

  return (
    <Box 
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh" // Full viewport height to ensure centering in the middle
    >
      <Box width="100%" maxWidth="600px"> {/* Adjust the width as needed */}
        <h2 style={{ textAlign: 'center' }}>Manage Operators</h2>
        {['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role) ? (
          <div>
            <List>
              {operators.map((operator) => (
                <ListItem key={operator.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <MuiLink component={Link} to={`/operator/${operator.id}`} style={{ marginRight: '10px' }}>
                    {operator.name} - {operator.letter}
                  </MuiLink>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen(operator)}
                    style={{ marginLeft: '10px' }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(operator.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Add Operator
              </Button>
            </Box>
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>You do not have permission to manage operators.</p>
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
            onChange={handleChange}
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
