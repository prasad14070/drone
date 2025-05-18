const express = require('express');
const _ = require('lodash');
const {Categorie, validate} = require('../models/categorie');
const router = express.Router();
const auth = require('../middleware/auth');
const {Mission} = require('../models/mission');
const {User} = require('../models/user');
const {Drone} = require('../models/drone');

categorie_in_user = async function(req, res, next){
    // check if the categorie is present with the user
    const user = await User.findById(req.user._id).select('categories');
    if(!user.categories.includes(req.params.id)) return res.status(400).send("Categorie is not registered for the user.");
    next();
};

router.post("/", auth, async(req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let categorie = new Categorie(_.pick(req.body, ["name", "color", "tag_name"]));
    const user = await User.findById(req.user._id);
    try{
        categorie = await categorie.save();
        user.categories.push(categorie._id);
        await user.save();
        return res.send(categorie);
    }
    catch(err){
        return res.status(400).send(err.message);
    }
});

router.put("/:id", [auth, categorie_in_user], async(req, res) => {
    try{
        const categorie = await Categorie.findByIdAndUpdate(
            req.params.id,
            _.pick(req.body, ["name", "color", "tag_name"]),
            {new: true}
        );
        if(!categorie)
            return res.status(404).send("The categorie with this given ID was not found.");
        
        res.send(categorie);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.delete("/:id", [auth, categorie_in_user], async(req, res) => {
    try{
        const categorie = await Categorie.findByIdAndDelete(req.params.id);
        if (!categorie)
            return res.status(404).send("The categorie with the given ID was not found.");
                
        // remove categorie from user obj
        const user = await User.findById(req.user._id).select('categories');
        const index = user.categories.indexOf(categorie._id);
        if(index > -1) {
            user.categories.splice(index, 1);
            await user.save();
        }

        // remove categorie from mission obj
        for(let i=0; i<categorie.missions.length; i++){
            await Mission.findByIdAndUpdate(
                categorie.missions[i],
                {"categorie": undefined}
            )
        }

        return res.send(categorie);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.get("/get-missions/:id", [auth, categorie_in_user], async(req, res) => {
    const categorie = await Categorie.findById(req.params.id);
    if(!categorie)
        return res.status(404).send("The categorie with the given ID was not found.");
    
    if(!categorie.missions.length){
        return res.send("No missions found");
    }

    try{
        const missions_list = [];
        for(let i=0;i<categorie.missions.length; i++){
            missions_list.push(await Mission.findById(categorie.missions[i]).select('-categorie'));
        }
        return res.send(missions_list);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

router.get("/get-drones/:id", [auth, categorie_in_user], async(req, res) => {
    const categorie = await Categorie.findById(req.params.id);
    if(!categorie)
        return res.status(404).send("The categorie with the given ID was not found.");
    
    if(!categorie.missions.length){
        return res.send("No Drones found");
    }
    try{
        const drone_id_set = new Set();
        for(let i=0;i<categorie.missions.length; i++){
            const mission = await Mission.findById(categorie.missions[i]).select('-categorie');
            for(let j=0;j<mission.drones.length; j++){
                drone_id_set.add(mission.drones[j]);
            }
        }
        const drone_list = [];
        const drone_id_list = Array.from(drone_id_set);
        for(let i=0;i<drone_id_list.length;i++){
            const drone = await Drone.findById(drone_id_list[i]);
            drone_list.push(drone);
        };
        return res.send(drone_list);
    }
    catch(err){
        return res.status(500).send(err.message);
    }
});

module.exports = router;
