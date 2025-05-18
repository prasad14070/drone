const mongoose = require('mongoose');
const Joi = require('joi');

const droneSchema = new mongoose.Schema({
    drone_id: {
        type: String,
        required: true,
        unique: true
    },
    
    drone_type: {
        type: String,
        required: true
    },
    make_name: {
        type: String
    },
    name: {
        type: String
    },
    mission: {
        type: mongoose.Schema.Types.ObjectId
    },
    site: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

const Drone = mongoose.model('Drone', droneSchema);

function validateDrone(drone) {
    const schema = Joi.object({
        drone_id: Joi.string().required(),
        drone_type: Joi.string().required(),
        make_name: Joi.string(),
        name: Joi.string()
    });
    
    return schema.validate(drone);
}

exports.droneSchema = droneSchema;
exports.Drone = Drone; 
exports.validate = validateDrone;