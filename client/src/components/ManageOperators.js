import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const ManageOperators = () => {
  const { user } = useUser();
  const [operators, setOperators] = useState([]);

  useEffect(() => {
    if (['Clerk', 'OLMC', 'APS'].includes(user?.role)) {
      axios.get('/api/operators')
        .then(response => setOperators(response.data))
        .catch(error => console.error('Error fetching operators:', error));
    }
  }, [user]);

  const handleAddOperator = () => {
    // Logic for adding an operator
  };

  const handleEditOperator = (operatorId) => {
    // Logic for editing an operator
  };

  const handleDeleteOperator = (operatorId) => {
    // Logic for deleting an operator
  };

  return (
    <div>
      <h2>Manage Operators</h2>
      {['Clerk', 'OLMC', 'APS'].includes(user?.role) ? (
        <div>
          <button onClick={handleAddOperator}>Add Operator</button>
          <ul>
            {operators.map(operator => (
              <li key={operator.id}>
                {operator.name} - {operator.letter}
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
