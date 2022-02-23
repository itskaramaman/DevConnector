const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Pasword is required').exists()
], async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const {email, password} = req.body;

    try {
        // see if user email exists
        let user = await User.findOne({email: email});

        if(!user) {
            res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }

        // password check
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }

        // return jwt
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600000 },
            (err, token) => {
                if(err) throw errors;
                res.json({ token });
            }
        );

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

