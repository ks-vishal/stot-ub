const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.User.findOne({ where: { username } });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    // Debug: print token and expiry
    console.log('Issued token:', token);
    const decoded = jwt.decode(token);
    console.log('Token exp:', new Date(decoded.exp * 1000).toISOString());
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyRole = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.debug = async (req, res) => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    
    // Test user lookup
    const user = await db.User.findOne({ where: { username: 'admin' } });
    
    res.json({
      databaseConnected: true,
      userFound: !!user,
      userData: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      } : null,
      models: Object.keys(db)
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ 
      error: 'Debug failed', 
      message: err.message,
      stack: err.stack 
    });
  }
}; 