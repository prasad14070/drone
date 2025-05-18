const mongoose = require('mongoose');
const configs = require('../startup/config');

module.exports = function() {
    mongoose.connect(`mongodb://${configs.MongoHost}:${configs.MongoPort}/${configs.MongoDB}`)
        .then(() => console.log('Connected to MongoDB...'))
        .catch(err => console.error("could not connect to mongoDB...", err));
}