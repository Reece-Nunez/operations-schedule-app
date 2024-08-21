import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, List, ListItem, Link as MuiLink, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const ManageOperators = () => {
  const { user } = useUser();
  const [operators, setOperators] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    letter: '',
    employeeId: '',
    phone: '',
    jobs: [] // Initialize as an empty array
  });

  useEffect(() => {
    if (['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role)) {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (token) { // Ensure the token exists
        axios.get('/api/operators', {
          headers: {
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
          }
        })
        .then(response => setOperators(response.data))
        .catch(error => {
          console.error('Error fetching operators:', error);
        });
      } else {
        console.error('No token found');
      }
    }
  }, [user]);

  const openEditForm = (operator) => {
    setEditForm({
      ...operator,
      jobs: operator.jobs || [], // Ensure jobs is an array
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleJobChange = (event) => {
    const { value } = event.target;
    setEditForm({
      ...editForm,
      jobs: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleClearJobs = () => {
    setEditForm({
      ...editForm,
      jobs:[]
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    try {
      await axios.put(`/api/operators/${editForm.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOperators(operators.map(op => (op.id === editForm.id ? editForm : op)));
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing operator:', error);
    }
  };

  const handleAddOperator = async () => {
    const newOperator = {
      name: prompt('Enter operator name:'),
      letter: prompt('Enter operator letter:'),
      employeeId: prompt('Enter operator employee ID:'),
      phone: prompt('Enter operator phone number:'),
      jobs: prompt('Enter operator jobs (comma-separated):').split(',') // Ensure this is an array
    };

    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    try {
      const response = await axios.post('/api/operators', newOperator, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOperators([...operators, response.data]);
    } catch (error) {
      console.error('Error adding operator:', error);
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    try {
      await axios.delete(`/api/operators/${operatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOperators(operators.filter(op => op.id !== operatorId));
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  };

  return (
    <div>
      <h2>Manage Operators</h2>
      {['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role) ? (
        <div>
          <Button variant="contained" color="primary" onClick={handleAddOperator}>
            Add Operator
          </Button>
          <List>
            {operators.map((operator) => (
              <ListItem key={operator.id} style={{ display: 'flex', alignItems: 'center' }}>
                <MuiLink component={Link} to={`/operator/${operator.id}`} style={{ marginRight: '10px' }}>
                  {operator.name} - {operator.letter}
                </MuiLink>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => openEditForm(operator)}
                  style={{ marginLeft: '10px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDeleteOperator(operator.id)}
                  style={{ marginLeft: '10px' }}
                >
                  Delete
                </Button>
              </ListItem>
            ))}
          </List>

          <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
            <DialogTitle>Edit Operator</DialogTitle>
            <DialogContent>
              <TextField
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Letter"
                name="letter"
                value={editForm.letter}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Employee ID"
                name="employeeId"
                value={editForm.employeeId}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Jobs</InputLabel>
                <Select
                  name="jobs"
                  multiple
                  value={editForm.jobs}
                  onChange={handleJobChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {/* Options can be dynamically generated based on your job options */}
                  <MenuItem value="FCC CONSOLE">FCC CONSOLE</MenuItem>
                  <MenuItem value="VRU CONSOLE">VRU CONSOLE</MenuItem>
                  <MenuItem value="FCC OUT">FCC OUT</MenuItem>
                  <MenuItem value="VRU OUT">VRU OUT</MenuItem>
                  <MenuItem value="BUTAMER">BUTAMER</MenuItem>
                  <MenuItem value="TANK FARM">TANK FARM</MenuItem>

                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClearJobs} color='secondary'>
                Clear Jobs
              </Button>
              <Button onClick={() => setIsEditing(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      ) : (
        <p>You do not have permission to manage operators.</p>
      )}
    </div>
  );
};

export default ManageOperators;
