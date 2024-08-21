import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const ManageOperators = () => {
  const { user } = useUser();
  const [operators, setOperators] = useState([]);

  useEffect(() => {
    if (['Clerk', 'OLMC', 'APS', 'Admin'].includes(user?.role)) {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      console.log(token);
      console.log(user);
      
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


  const handleAddOperator = async () => {
    const newOperator = {
      name: prompt('Enter operator name:'),
      letter: prompt('Enter operator letter:'),
      employeeId: prompt('Enter operator employee ID:'),
      phone: prompt('Enter operator phone number:'),
      jobs: prompt('Enter operator jobs (comma-separated):')
    };

    try {
      const response = await axios.post('/api/operators', newOperator);
      setOperators([...operators, response.data]);
    } catch (error) {
      console.error('Error adding operator:', error);
    }
  };

  const handleEditOperator = async (operatorId) => {
    const updatedOperator = {
      name: prompt('Enter new operator name:'),
      letter: prompt('Enter new operator letter:'),
      employeeId: prompt('Enter new operator employee ID:'),
      phone: prompt('Enter new operator phone number:'),
      jobs: prompt('Enter new operator jobs (comma-separated):')
    };

    try {
      const response = await axios.put(`/api/operators/${operatorId}`, updatedOperator);
      setOperators(operators.map(op => (op.id === operatorId ? response.data : op)));
    } catch (error) {
      console.error('Error editing operator:', error);
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    try {
      await axios.delete(`/api/operators/${operatorId}`);
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
          <button onClick={handleAddOperator}>Add Operator</button>
          <ul>
            {operators.map(operator => (
              <li key={operator.id}>
                <Link to={`/operator/${operator.id}`}>
                  {operator.name} - {operator.letter}
                </Link>
                <button onClick={() => handleEditOperator(operator.id)}>Edit</button>
                <button onClick={() => handleDeleteOperator(operator.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>You do not have permission to manage operators.</p>
      )}
    </div>
  );
};

export default ManageOperators;
