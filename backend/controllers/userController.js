const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const secretKey = 'secret_key'; 


// Middleware to extract and verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  //Checking if token, if theres no token it returns 401 unauthoritzed
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { exp } = decoded;

    
    if (Date.now() >= exp * 1000) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    req.user = decoded;
    next();
  });
};
//Error when name/email/password is not filled
const validateCreateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  let err = [];
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (err?.length != 0)
    return res.status(400).json({ error: err });

  next();
};

const validateLoginUser = (req, res, next) => {
  const { email, password } = req.body;

  let err = [];

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (err?.length != 0)
    return res.status(400).json({ error: err });

  next();
};


// Sign up new user
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    let isExist = await User.findOne({ email: email });
    if (!isExist) {
      const user = await User.create({ name, email, password });
      res.status(200).json(user);
    }
    else {
      res.status(400).json({ error: "already exist user" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user with else statement when login detail/not exisiting user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      if (user?.password == password) {

        delete user?._doc?.password;
        const expirationTime = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 hours
        const token = jwt.sign({ ...user?._doc, exp: expirationTime }, secretKey);

        res.status(200).json({ ...user?._doc, token: token });
      }
      else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    }
    else {
      res.status(400).json({ error: "User does not exist" });
    }

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  loginUser,
  createUser,
  validateCreateUser,
  validateLoginUser,
  authenticateToken
};
