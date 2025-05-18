const express = require('express');
const _ = require('lodash');
const {Drone, validate} = require('../models/drone');
const router = express.Router();
const auth = require('../middleware/auth');
const {User} = require('../models/user');
const {Site} = require('../models/site')
const {Mission} = require('../models/mission')

drone_in_user = async function(req, res, next){
    // check if the drone is present with the user
    const user = await User.findById(req.user._id).select('drones');
    if(!user.drones.includes(req.params.id)) return res.status(400).send("Drone is not registered for the user.");
    next();
};

router.post("/", auth, async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let drone = new Drone(_.pick(req.body, ["drone_id", "drone_type", "make_name", "name"]));
    const user = await User.findById(req.user._id);
    try{
        drone = await drone.save();
        user.drones.push(drone._id);
        await user.save();
        return res.send(drone);
    }
    catch(err){
        return res.status(400).send(err.message);
    }
});

router.put("/:id", [auth, drone_in_user], async(req, res) => {
    try{
        const drone = await Drone.findByIdAndUpdate(
            req.params.id,
            _.pick(req.body, ["drone_id", "drone_type", "make_name", "name", "site_name"]),
            {new: true}
        );
        if(!drone)
            return res.status(404).send("The drone with this given ID was not found.");
        
        res.send(drone);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.delete("/:id", [auth, drone_in_user], async(req, res) => {
    try{
        const drone = await Drone.findByIdAndDelete(req.params.id);
        if (!drone)
            return res.status(404).send("The drone with the given ID was not found.");
                
        // remove drone from user obj
        const user = await User.findById(req.user._id).select('drones');
        const index = user.drones.indexOf(drone._id);
        if(index > -1) {
            user.drones.splice(index, 1);
            await user.save();
        }

        // remove drone from mission object
        if(drone.mission){
            const mission = await Mission.findById(drone.mission);
            const index = mission.drones.indexOf(drone._id);
            if(index > -1) mission.drones.splice(index, 1);
            await mission.save();
        }

        // remove drone from the site object
        if(drone.site){
            const site = await Site.findById(drone.site);
            const index = site.drones.indexOf(drone._id);
            if(index > -1) site.drones.splice(index, 1);
            await site.save();
        }

        return res.send(drone);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

module.exports = router;
