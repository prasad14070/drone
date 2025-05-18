const express = require('express');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();
const auth = require('../middleware/auth');

router.get("/me", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.send(user);
    }
    catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/', async(req, res) => {
    const {error} = validate(req.body)
    if(error) return res.status(400).send(error);

    let user = await User.findOne({ email_id: req.body.email_id });
    if (user) return res.status(400).send("User already registered.");
    
    user = new User(_.pick(req.body, ["name", "password", "contact", "email_id"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;