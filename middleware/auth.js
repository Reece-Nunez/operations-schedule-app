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
    console.log('Authentication successful:', decoded); // Add this log

    const user = await User.findOne({ where: { id: decoded.id } });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Received Token:', token);
      console.log('Decoded Token:', decoded);
      console.log('Found User:', user);
    }

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
    if (!req.user) {
      console.error('Authorization error: req.user is undefined');
      return res.status(401).send({ error: 'Not authenticated.' });
    }
    console.log('User role:', req.user.role); // Debugging: Log user role
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: 'Access denied.' });
    }
    next();
  };
};

const checkAdmin = authorize(["Admin", "OLMC", "APS"]);

module.exports = { authenticate, authorize, checkAdmin };
