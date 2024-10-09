const express = require('express');
const User = require('../models/user');
const route = express.Router();
const _ = require('lodash');
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
      callback(null, 'storage/users');
    },
    filename: function (request, file, callback) {
        
        callback(null, file.originalname + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, callback) {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (extname && mimetype) {
        return callback(null, true);
      } else {
        callback(new Error('Images only(jpeg, jpg, png)'));
      }
    }
});

const registerValidator = [
    body('email').isEmail().notEmpty().withMessage("Email Incorrect"),
    body('first_name').notEmpty().withMessage("First name incorrect"),
    body('last_name').notEmpty().withMessage("Last name incorrect"),
    body('age').isNumeric().withMessage("Age incorrect"),
];
const loginValidator = [
    body('email').isEmail().notEmpty().withMessage("Email Incorrect"),
    body('password').notEmpty().withMessage("Your password must have at least 8 characters")
];

route.post('/register', upload.single('profilePic'),registerValidator,async (request, response, next) => {
    const { first_name, last_name, email, password, age } = request.body;
    if (!first_name || !last_name || !email || !password || !age || !request.file) {
        return response.status(400).json({ error: 'All fields including profile picture are required' });
    }
    if (typeof Number(age) == NaN ) {
        return response.status(400).json({ error: 'Incorrect age' });
    }
    
    try {
        const userInput = request.body;
        const existingUser = await User.findOne({where: {email: userInput.email}});
        if (existingUser) return response.status(400).send({message: "Account is already registered", ok: false});
        const newUser = await User.create({...userInput, age: Number(age), picture_path: `storage/users/${request.file.filename}`, picture_url: ''});
        const token = newUser.getToken(newUser);
        response.status(201).send({message: "User successfully created", user: {..._.omit(newUser, ['password']), token}, ok: true});
    } catch (error) {
        next(error);
    }
}); 

route.post('/login', loginValidator, async (request, response,  next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) return response.status(400).send({errors: errors.array()});
    try {
        const userInput = request.body;
        const existingUser = await User.findOne({where: {email: userInput.email}});
        if (!existingUser) return response.status(400).send({message: "Email or password incorrect", ok: false});
        const validPassword = existingUser.validPassword(userInput, existingUser.password);
        if (!validPassword) return response.status(400).send({message: "Email or password incorrect", ok: false});
        const token = existingUser.getToken(existingUser);
        response.status(200).send({message: "User login", user: {..._.omit(newUser, ['password']), token}, ok: true});
    } catch (error) {
        next(error);
    }
});

route.delete('/logout', async(request, response, next) => {
    try {
        response.send({message: "Deconnected", user: {}, ok: true});
    } catch (error) {
        next(error);
    }
});

module.exports = route;