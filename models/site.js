const mongoose = require('mongoose');
const Joi = require('joi');

const siteSchema = new mongoose.Schema({
    site_name: {
        type: String,
        required: true,
        unique: true
    },
    position: {
        type: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
        required: true
    },
    missions: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    drones: {
        type: [mongoose.Schema.Types.ObjectId]
    },
});

const Site = mongoose.model('Site', siteSchema);

function validateSite(site) {
    const schema = Joi.object({
        site_name: Joi.string().required(),
        position: Joi.object().required()
    });
    
    return schema.validate(site);
}

exports.siteSchema = siteSchema;
exports.Site = Site; 
exports.validate = validateSite;