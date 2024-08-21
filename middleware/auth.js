const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findOne({ where: { id: decoded.id } });

    console.log('Received Token:', token); // Log the received token
    console.log('Decoded Token:', decoded); // Log the decoded token
    console.log('Found User:', user); // Log the found user

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(401).send({ error: 'Invalid token.' });
  }
};


const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: 'Access denied.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
