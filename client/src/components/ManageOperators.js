import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, List, ListItem, Link as MuiLink, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl, Paper, Typography, Box } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const Container = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#f5f5f5',
});

const StyledPaper = styled(Paper)({
  padding: '20px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
  borderRadius: '10px',
  backgroundColor: '#fff',
});

const Title = styled(Typography)({
  textAlign: 'center',
  marginBottom: '20px',
});

const ButtonGroup = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
});

const StyledList = styled(List)({
  marginBottom: '20px',
});

const StyledListItem = styled(ListItem)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ddd',
});

const DialogActionButtons = styled(DialogActions)({
  justifyContent: 'space-between',
});

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
    jobs: [],
  });
  const navigate = useNavigate();

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
      jobs: operator.jobs || [],
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
      jobs: []
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
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
      jobs: prompt('Enter operator jobs (comma-separated):').split(',')
    };

    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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

  const handleBack = () => {
    navigate('/home');
}

  return (
    <Container>
      <StyledPaper>
        <Title variant="h4">
          Manage Operators
        </Title>
        {['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role) ? (
          <>
            <ButtonGroup>
              <Button variant="contained" color="primary" onClick={handleAddOperator}>
                Add Operator
              </Button>
            </ButtonGroup>
            <StyledList>
              {operators.map((operator) => (
                <StyledListItem key={operator.id}>
                  <MuiLink component={Link} to={`/operator/${operator.id}`}>
                    {operator.name} - {operator.letter}
                  </MuiLink>
                  <div>
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
                  </div>
                </StyledListItem>
              ))}
            </StyledList>

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
                    <MenuItem value="FCC CONSOLE">FCC CONSOLE</MenuItem>
                    <MenuItem value="VRU CONSOLE">VRU CONSOLE</MenuItem>
                    <MenuItem value="FCC OUT">FCC OUT</MenuItem>
                    <MenuItem value="VRU OUT">VRU OUT</MenuItem>
                    <MenuItem value="BUTAMER">BUTAMER</MenuItem>
                    <MenuItem value="TANK FARM">TANK FARM</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActionButtons>
                <Button onClick={handleClearJobs} color='secondary'>
                  Clear Jobs
                </Button>
                <Button onClick={() => setIsEditing(false)} color="secondary">
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit} color="primary">
                  Save
                </Button>
              </DialogActionButtons>
            </Dialog>
          </>
        ) : (
          <Typography color="error" align="center">
            You do not have permission to manage operators.
          </Typography>
        )}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
          onClick={handleBack}
          color='primary'
          variant='contained'
          >
            Back
          </Button>
        </div>
      </StyledPaper>
    </Container>
  );
};

export default ManageOperators;
