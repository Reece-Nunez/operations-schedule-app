const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Operator } = require('../models');
const { authenticate, authorize } = require('../models/middleware/auth');
const router = express.Router();

// Route to register a user (public)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log('Login attempt with email:' , email);
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to login a user (public)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Received login request:', { email, password });  // Log the request data

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found with email:', email);  // Log if the user is not found
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    console.log('Found user:', user);  // Log the found user data

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);  // Log the result of the password comparison

    if (!isMatch) {
      console.log('Password mismatch for user:', email);  // Log if the password does not match
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    console.error('Error during login process:', error);  // Log any errors during the login process
    res.status(500).send({ error: 'Server error during login' });
  }
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

});

// Route to get operators (protected, only accessible by Clerk, OLMC, and APS)
router.get('/operators', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  try {
    const operators = await Operator.findAll();
    res.send(operators);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching operators' });
  }
});

// Route to add an operator (protected, only accessible by Clerk, OLMC, and APS)
router.post('/operators', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  const { name, letter, employeeId, phone, jobs } = req.body;

  try {
    const operator = await Operator.create({ name, letter, employeeId, phone, jobs });
    res.status(201).send(operator);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to update an operator (protected, only accessible by Clerk, OLMC, and APS)
router.put('/operators/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
  const { name, letter, employeeId, phone, jobs } = req.body;

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
    console.error('Login error', error);
    res.status(500).send({ error: 'Error deleting operator' });
  }
});

module.exports = router;