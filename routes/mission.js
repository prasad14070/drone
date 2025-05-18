const express = require('express');
const _ = require('lodash');
const {Mission, validate} = require('../models/mission');
const router = express.Router();
const auth = require('../middleware/auth');
const {Site} = require('../models/site');
const {User} = require('../models/user');
const {Drone} = require('../models/drone');
const {Categorie} = require('../models/categorie');

mission_in_user = async function(req, res, next){
    // check if the Mission is present in the user account
    const user = await User.findById(req.user._id).select('missions');
    if(!user.missions.includes(req.params.id)) return res.status(400).send("Mission is not registered for the user.");
    next();
};

router.post("/", auth, async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    try{
        const site = await Site.findById(req.body.site).select("missions");
        if(!site) return res.status(404).send("Site is not available");

        let mission = new Mission(_.pick(req.body, ["name", "alt", "speed", "waypoints", "site"]));
        mission.site = site._id;
        mission = await mission.save();
        
        // save mission id in site obj
        site.missions.push(mission._id);
        await site.save();

        // save mission id in user obj
        const user = await User.findById(req.user._id);
        user.missions.push(mission._id);
        await user.save();

        return res.send(mission);
    }
    catch(err){
        return res.status(400).send(`Error:- ${err.message}`);
    }
});

router.put("/:id", [auth, mission_in_user], async(req, res) => {
    const mission = await Mission.findById(req.params.id);
    if(req.body.site && !mission.site.equals(req.body.site)) return res.status(400).send("Site for the mission cannot be updated.");

    try{
        const mission = await Mission.findByIdAndUpdate(
            req.params.id,
            _.pick(req.body, ["name", "alt", "speed", "waypoints"]),
            {new: true}
        );
        if(!mission)
            return res.status(404).send("The mission with this given ID was not found.");
        
        res.send(mission);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.put("/assign-drone/:id", [auth, mission_in_user], async(req, res) => {
    // check if drone is present in user account
    const user = await User.findById(req.user._id).select("drones");
    if(!user.drones.includes(req.body.drone_id)) return res.status(400).send("Drone is not present in the User account.");

    // check if site in drone is == site in mission
    const mission = await Mission.findById(req.params.id);
    const drone = await Drone.findById(req.body.drone_id);
    if(!mission.site.equals(drone.site)){
        return res.status(400).send("Drone and Mission are part of different site");
    }    

    try{
        // remove drone _id from existing mission
        if(drone.mission){
            const mission = await Mission.findById(drone.mission);
            const index = mission.drones.indexOf(drone._id);
            if(index > -1) mission.drones.splice(index, 1);
            await mission.save();
        }

        mission.drones.push(drone._id);
        drone.mission = mission._id;
        await mission.save();
        await drone.save();
        return res.send("Operation Successful");
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.put("/assign-categorie/:id", [auth, mission_in_user], async(req, res) => {
    // check if categorie is present in user account
    const user = await User.findById(req.user._id).select("categories");
    if(!user.categories.includes(req.body.categorie_id)) return res.status(400).send("Categorie is not present in the User account.");

    // remove categorie _id from existing mission
    const mission = await Mission.findById(req.params.id);
    if(mission.categorie){
        const categorie = await Categorie.findById(mission.categorie);
        const index = categorie.missions.indexOf(mission._id);
        if(index > -1) categorie.missions.splice(index, 1);
        await categorie.save();
    }
    
    const categorie = await Categorie.findById(req.body.categorie_id);
    categorie.missions.push(mission._id);
    mission.categorie = categorie._id;
    try{
        await mission.save();
        await categorie.save();
        return res.send("Operation Successful");
    }
    catch(err){
        return res.status(500).send(err.message);
    }    
});

router.delete("/:id", [auth, mission_in_user], async(req, res) => {
    try{
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission)
            return res.status(404).send("The mission with the given ID was not found.");
             
        // remove mission from user obj
        const user = await User.findById(req.user._id).select('missions');
        const index = user.missions.indexOf(mission._id);
        if(index > -1) {
            user.missions.splice(index, 1);
            await user.save();
        }

        // remove mission from the site object
        if(mission.site){
            const site = await Site.findById(mission.site);
            const index = site.missions.indexOf(mission._id);
            if(index > -1) site.missions.splice(index, 1);
            await site.save();
        }

        // remove all the drones from the current mission
        for(let i=0; i<mission.drones.length; i++){
            await Drone.findByIdAndUpdate(
                mission.drones[i],
                {"mission": undefined}
            )
        }

        return res.send(mission);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

module.exports = router;
