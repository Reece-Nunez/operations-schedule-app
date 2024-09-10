const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Operator } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

console.log("authRoutes.js is being imported correctly");

// Route to login a user (public)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Received login request:', { email, password });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    console.log('Found user:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return token and user data
    res.status(200).send({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar
      } 
    });
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).send({ error: 'Server error during login' });
  }
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
});

// Route to register new users
router.post('/register', async (req, res) => {
  console.log('Register route accessed with data:', req.body);
  const { id, name, email, password, phone, role, letter, team } = req.body;

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // If role is 'Operator', check if 'letter' is provided
  if (role === 'Operator' && !letter) {
    return res.status(400).send({ error: 'Letter is required for Operators.' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).send({ error: 'Password must include 8 or more characters, 1 uppercase letter, 1 number, and 1 special character.' });
  }

  try {
    // Check if the ID or email already exists
    const existingUser = await User.findOne({ where: { id } });
    const existingEmail = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send({ error: 'ID already exists.' });
    }
    if (existingEmail) {
      return res.status(400).send({ error: 'Email already in use.' });
    }

    let status = 'active';
    if (role === 'Clerk' || role === 'OLMC') {
      status = 'pending';
    }

    console.log(`Role: ${role}, Status set to: ${status}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create the user
    const user = await User.create({ id, name, email, password: hashedPassword, phone, role, letter, status });

    // If the user is an Operator, create an Operator record
    if (role === 'Operator') {
      const existingOperator = await Operator.findOne({ where: { employeeId } });
      if (!existingOperator) {
        await Operator.create({ name, phone, letter, email, employeeId, role, status, team });  // Include `team` here
      }
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(400).send({ error: error.message || 'Registration failed. Please try again.' });
  }
});

// Route to update an operator (protected, only accessible by Clerk, OLMC, and APS)
router.put('/operators/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  const { name, letter, employeeId, phone, jobs, email, team } = req.body;

  try {
    const operator = await Operator.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).send({ error: 'Operator not found' });
    }

    operator.name = name || operator.name;
    operator.letter = letter || operator.letter;
    operator.employeeId = employeeId || operator.employeeId;
    operator.phone = phone || operator.phone;
    operator.jobs = jobs || operator.jobs;
    if (email !== undefined) operator.email = email;
    if (team !== undefined) operator.team = team; // Update the team field

    await operator.save();
    res.send(operator);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to delete an operator (protected, only accessible by Clerk, OLMC, and APS)
router.delete('/operators/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  try {
    const operator = await Operator.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).send({ error: 'Operator not found' });
    }

    await operator.destroy();
    res.send({ message: 'Operator deleted' });
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).send({ error: 'Error deleting operator' });
  }
});

// Route to get all operators
router.get('/operators', authenticate, async (req, res) => {
  try {
    const operators = await Operator.findAll(); // Fetch all operators
    res.status(200).json(operators); // Respond with all operators
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).send('Server error');
  }
});

// Route to get a specific operator by ID
router.get('/operators/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const operator = await Operator.findByPk(id); // Find operator by ID
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }
    res.json(operator);
  } catch (error) {
    console.error('Error fetching operator:', error);
    res.status(500).send('Server error');
  }
});


// Route to add an operator (protected, only accessible by Clerk, OLMC, and APS)
router.post('/operators', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  const { name, letter, employeeId, phone, jobs, email, team } = req.body;

  try {
    // Check if employeeId already exists
    const existingOperator = await Operator.findOne({ where: { employeeId } });
    if (existingOperator) {
      return res.status(400).send({ error: 'Employee ID must be unique. An operator with this Employee ID already exists.' });
    }

    const operator = await Operator.create({ name, letter, employeeId, phone, jobs, email, team });
    res.status(201).send(operator);
  } catch (error) {
    console.error('Error creating operator: ', error);
    res.status(500).send({ error: 'Server error occured while creating operator.'});
  }
});

// Route to update an operator
router.put('/operators/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  console.log('Request body:', req.body); // Add this line to log the incoming data
  const { name, letter, employeeId, phone, jobs, email, team } = req.body;

  try {
    // Find operator by id (the new primary key)
    const operator = await Operator.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).send({ error: 'Operator not found' });
    }

    // Only update fields if they are provided
    if (employeeId && employeeId !== operator.employeeId) {
      const existingOperator = await Operator.findOne({ where: { employeeId } });
      if (existingOperator) {
        return res.status(400).send({ error: 'Employee ID must be unique. An operator with this Employee ID already exists.' });
      }
      operator.employeeId = employeeId;
    }

    operator.name = name || operator.name;
    operator.letter = letter || operator.letter;
    operator.phone = phone || operator.phone;
    operator.jobs = jobs || operator.jobs;
    if (email !== undefined) operator.email = email;
    if (team !== undefined) operator.team = team; // Update the team field

    await operator.save();
    res.send(operator);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update operator. Please try again.' });
  }
});

// Route to delete an operator (use `id` as primary key)
router.delete('/operators/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  try {
    const operator = await Operator.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).send({ error: 'Operator not found' });
    }

    await operator.destroy();
    res.send({ message: 'Operator deleted' });
  } catch (error) {
    res.status(500).send({ error: 'Error deleting operator' });
  }
});

module.exports = router;
