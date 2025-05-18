const express = require('express');
const app = express();
const configs = require('./startup/config');
const drones = require('./routes/drone');
const user = require('./routes/user')
const login = require('./routes/auth');
const site = require('./routes/site');
const mission = require('./routes/mission');
const categorie = require('./routes/categorie');

if(!configs.jwtPrivateKey){
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
};

require("./startup/db")();
app.use(express.json());
app.use('/api/login', login);
app.use('/api/users', user);
app.use('/api/drones', drones);
app.use('/api/sites', site);
app.use('/api/missions', mission); 
app.use('/api/categories', categorie); 

const port = configs.ServerPort;
app.listen(port, () => console.log(`listining to port ${port}....`));
