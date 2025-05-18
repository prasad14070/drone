const mongoose = require('mongoose');
const Joi = require('joi');

const categorieSchema = new mongoose.Schema({
    "name": {
        type: String,
        required: true,
        unique: true
    },
    "color": {
        type: String,
        required: true
    },
    "tag_name": {
        type: String
    },
    "missions": {
        type: [mongoose.Schema.Types.ObjectId]
    }
}, { timestamps: true });

const Categorie = mongoose.model('Categorie', categorieSchema);

function validateCategorie(categorie) {
    const schema = Joi.object({
        name: Joi.string().required(),
        color: Joi.string().required(),
        tag_name: Joi.string(),
    });
    
    return schema.validate(categorie);
}

exports.categorieSchema = categorieSchema;
exports.Categorie = Categorie; 
exports.validate = validateCategorie;