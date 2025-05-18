const mongoose = require('mongoose');
const Joi = require('joi');

const missionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    alt: {
        type: Number
    },
    speed: {
        type: Number
    },
    waypoints: {
        type: [
            {
                alt: {
                    type: Number,
                    required: true
                },
                lat: {
                    type: Number,
                    required: true
                },
                lng: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId
    },
    site: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    drones: {
        type: [mongoose.Schema.Types.ObjectId]
    }
}, { timestamps: true });

const Mission = mongoose.model('Mission', missionSchema);

function validateMission(mission) {
    const waypoint_schema = Joi.object().keys({
        alt: Joi.number().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required()
    });

    const schema = Joi.object({
        name: Joi.string().required(),
        alt: Joi.number(),
        speed: Joi.number(),
        waypoints: Joi.array().items(waypoint_schema),
        site: Joi.string().required()
    });
    
    return schema.validate(mission);
}

exports.missionSchema = missionSchema;
exports.Mission = Mission; 
exports.validate = validateMission;