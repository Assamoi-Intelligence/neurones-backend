const express = require('express');
const User = require('../models/user');
const route = express.Router();
const _ = require('lodash');
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'storage'})

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

route.post('/register', registerValidator,async (request, response, next) => {
    const { filename, mimetype, size } = request.file;
    console.log(request.body);
    const errors = validationResult(request);
    if (!errors.isEmpty()) return response.status(400).send({errors: errors.array()});
    try {
        const userInput = request.body;
        const existingUser = await User.findOne({where: {email: userInput.email}});
        if (existingUser) return response.status(400).send({message: "Account is already registered", ok: false});
        const newUser = await User.create({...userInput, picture_path: `storage/users/${filename}`});
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