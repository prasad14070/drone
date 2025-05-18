const express = require('express');
const _ = require('lodash');
const {Site, validate} = require('../models/site');
const router = express.Router();
const {User} = require('../models/user');
const {Drone} = require('../models/drone');
const auth = require('../middleware/auth');
const {Mission} = require('../models/mission');

site_in_user = async function(req, res, next) {
    // check if the site is present with the user
    const user = await User.findById(req.user._id).select('sites');
    if(!user.sites.includes(req.params.id)) return res.status(400).send("Site is not registered for the user.");
    next();
};

router.post("/", auth, async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let site = new Site(_.pick(req.body, ["site_name", "position"]));
    const user = await User.findById(req.user._id);
    try{
        site = await site.save();
        user.sites.push(site._id);
        user.save();
        return res.send(site);
    }
    catch(err){
        return res.status(400).send(err.message);
    }
});

router.put("/assign-drone/:id", [auth, site_in_user], async(req, res) => {
    // check if drone is present in user account
    const user = await User.findById(req.user._id).select("drones");
    if(!user.drones.includes(req.body.drone_id)) return res.status(400).send("Drone is not present in the User account.");

    // remove drone _id from existing site
    const drone = await Drone.findById(req.body.drone_id);
    if(drone.site){
        const site = await Site.findById(drone.site);
        const index = site.drones.indexOf(drone._id);
        if(index > -1) site.drones.splice(index, 1);
        await site.save();
    }

    const site = await Site.findById(req.params.id);
    site.drones.push(drone._id);
    drone.site = site._id;
    try{
        await site.save();
        await drone.save();
        return res.send("Operation Successful");
    }
    catch(err){
        return res.status(500).send(err.message);
    }
})

router.put("/:id", [auth, site_in_user], async(req, res) => {
    try{
        const site = await Site.findByIdAndUpdate(
            req.params.id,
            _.pick(req.body, ["site_name", "position"]),
            {new: true}
        );
        if(!site)
            return res.status(404).send("The site with this given ID was not found.");

        res.send(site);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.delete("/:id", [auth, site_in_user], async(req, res) => {
    try{
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site)
            return res.status(404).send("The site with the given ID was not found.");
    
        // check if missions present
        if(site.missions.length > 0) return res.status(404).send("site is used by other missions, so cannot be deleted.");
        
        // remove site from user obj
        const user = await User.findById(req.user._id).select('sites');
        const index = user.sites.indexOf(site._id);
        if(index > -1) {
            user.sites.splice(index, 1);
            await user.save();
        }
        
        // remove site from drone obj
        for(let i=0; i<site.drones.length; i++){
            await Drone.findByIdAndUpdate(
                site.drones[i],
                {"site": undefined}
            )
        }

        return res.send(site);
    }
    catch(err){
        return res.status(500).send(err.message);
    }    
});

router.get("/get-missions/:id", [auth, site_in_user], async(req, res) => {
    const site = await Site.findById(req.params.id);
    if(!site)
        return res.status(404).send("The site with the given ID was not found.");
    
    if(!site.missions.length){
        return res.send("No missions found");
    }

    try{
        const missions_list = [];
        for(let i=0;i<site.missions.length; i++){
            missions_list.push(await Mission.findById(site.missions[i]).select('-site'));
        }
    
        return res.send(missions_list);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.get("/get-drones/:id", [auth, site_in_user], async(req, res) => {
    const site = await Site.findById(req.params.id);
    if(!site)
        return res.status(404).send("The site with the given ID was not found.");
    
    if(!site.drones.length){
        return res.send("No drones found");
    }

    try{
        const drones_list = [];
        for(let i=0;i<site.drones.length; i++){
            drones_list.push(await Drone.findById(site.drones[i]).select('-site'));
        }
    
        return res.send(drones_list);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

module.exports = router;