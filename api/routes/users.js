const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Mail = require('@sendgrid/mail');

Mail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/signup', (req, res, next)=>{
    User.find({username: req.body.username})
    .exec()
    .then(user => {
        if (user.length >= 1) {
            res.status(409).json({
                message: 'Username already taken'
            })
        }
        else{
            bcrypt.hash(req.body.password, 10, (err, hash)=> {
                if (err){
                    res.status(500).json({
                        error: err
                    })
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        username: req.body.username,
                        password: hash
                    })
                    user.save()
                    .then(result => {
                        res.status(201).json({
                            message: 'User Created Succesfully'
                        })
                    })
                    .then(respond => {
                        const msg = {
                            to: req.body.username,
                            from: 'shop@no-reply.com',
                            subject: 'Welcome To shop',
                            html: '<h1> The best place to be <h1> <p>This is the best site on the planet <p>'
                        }
                        Mail.send(msg)
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
})
router.post('/login', (req, res) => {
    User.find({username: req.body.username})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: 'Auth Failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result)=>{
            if(err){
                return res.status(401).json({
                    message: 'Auth Failed'
                })
            }
            if (result){
                const token = jwt.sign(
                {
                    username: user[0].username,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: '1hr'
                }
                )
                return res.status(200).json({
                    message: 'Auth Succesfull',
                    token: token
                })
            }
            res.status(401).json({
                message: 'Auth Failed'
            })   
        })
    })
    .catch()
})

router.delete('/:userId', (req, res) => {
    User.findByIdAndDelete(req.params.userId)
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted'
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;