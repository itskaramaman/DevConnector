const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const {check, validationResult} = require('express-validator'); 
const User = require('../../models/User');


// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res)=>{
    try{
        // get the profile, as its linked with use 
        // we can use req.user and we can populate it with user data as well 
        const profile = await Profile.findOne({user:req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile) {
            return res.status(400).json({msg: 'There is no profile with this user'})
        }

        res.json(profile)
    } catch(err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});


// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post('/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(), 
            check('skills', 'Skills are required').not().isEmpty()
        ]
    ],
        async (req, res)=> {

            // check validations
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()})
            }

            // get data from req.body
            const {
                company,
                website,
                location,
                bio,
                status,
                githubusername,
                skills,
                youtube,
                facebook,
                twitter,
                instagram,
                linkedin
            } = req.body;

            //Build profile object
            const profileFields = {};
            profileFields.user = req.user.id;

            if(company) profileFields.company = company;
            if(website) profileFields.website = website;
            if(location) profileFields.location = location;
            if(bio) profileFields.bio = bio;
            if(status) profileFields.status = status;
            if(githubusername) profileFields.githubusername = githubusername;
            if(skills) {
                profileFields.skills = skills.split(',').map(skill=>skill.trim());
            }

            // Build social object
            profileFields.social = {};
                if(youtube) profileFields.social.youtube = youtube;
                if(twitter) profileFields.social.twitter = twitter;
                if(facebook) profileFields.social.facebook = facebook;
                if(linkedin) profileFields.social.linkedin = linkedin;
                if(instagram) profileFields.social.instagram = instagram;
            

            try {

                let profile = await Profile.findOne({user: req.user.id});
                if(profile){
                    // Update
                    profile = await Profile.findOneAndUpdate(
                        {user: req.user.id},
                        {$set: profileFields},
                        {new: true}
                    );

                    return res.json(profile);
                }

                //Create profile
                profile = new Profile(profileFields);
                await profile.save();
                res.json(profile);

            } catch(err) {
                console.log(err.message);
                res.send(500).send('Server Error');
            }
})


// @route   GET api/profile
// @desc    Get all profile
// @access  Public
router.get('/', async(req, res)=>{
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (err) {
        console.log(err.msg);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/user/:user_id
// @desc    Get profile by id
// @access  Public
router.get('/user/:user_id', async(req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({'msg': 'Profile nor found.'});
        res.json(profile);

    } catch (err) {
        console.log(err.msg);
        // if user_id provided is not valid this error will be shown
        if(err.kind == 'ObjectId') res.status(400).json({'msg': 'Profile nor found.'});
        // in case of server
        res.status(500).send('Server Error');
    }
})

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async(req, res)=>{
    try {
        // @todo - remove users posts
        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({msg: 'User Deleted'});

    } catch (err) {
        console.log(err.msg);
        // if user_id provided is not valid this error will be shown
        if(err.kind == 'ObjectId') res.status(400).json({'msg': 'Profile nor found.'});
        // in case of server
        res.status(500).send('Server Error');
    }
})

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience', 
    [
        auth, 
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ]
    ], 
    async (req, res)=>{
        // check if any errors
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array});
        }

        // get the data from req body
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        // create new experience
        const newExp = {
            title: title,
            company: company,
            location: location,
            from,
            to,
            current,
            description
        }

        try {
            // get profile of user
            const profile = await Profile.findOne({user: req.user.id});
            // add the newExperience to th first in experience array
            profile.experiences.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);



// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async(req, res)=>{
    try {
        // get profile
        const profile = await Profile.findOne({user: req.user.id});
        // get remove index
        profile.experiences = profile.experiences.filter(item=>item.id != req.params.exp_id);
        // save the user
        await profile.save();
        res.json({msg: 'Experiene Deleted'});
    } catch (err) {
        console.log(err.msg);
        res.status(500).send('Server Error');
    }
})

// @route   PUT api/profile/education
// @desc    Add profile eductaion
// @access  Private
router.put(
    '/education', 
    [
        auth, 
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ]
    ], 
    async (req, res)=>{
        // check if any errors
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array});
        }

        // get the data from req body
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        // create new experience
        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            // get profile of user
            const profile = await Profile.findOne({user: req.user.id});
            // add the newExperience to th first in experience array
            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);



// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async(req, res)=>{
    try {
        // get profile
        const profile = await Profile.findOne({user: req.user.id});
        // get remove index
        profile.education = profile.education.filter(item=>item.id != req.params.exp_id);
        // save the user
        await profile.save();
        res.json({msg: 'Education Deleted'});
    } catch (err) {
        console.log(err.msg);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', (req, res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&cliend_id=${config.get('githubClient')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'} 
        };

        request(options, (err, response, body)=>{
            if(err) console.log(err.message);

            if(response.statusCode !== 200) {
                return res.status(404).json({msg: 'No github profile found'});
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;

