const mongoose = require('mongoose'); // import mongoose to connect with database
const config = require('config'); // get the config file
const db = config.get('mongoURI'); // get the db URI from config, we used get beacuse config does not export anythig

// connect using async as its new standard
const connectDB = async () => {
    try {
        // await for the mongoose to connect, {useNewUrlParser: true} is not required its just for url string parser
        await mongoose.connect(db, {useNewUrlParser: true});
        console.log('MongoDB connected');
    } catch(error){
        console.log(error.message);
        // exit process with failure
        process.exit(1);
    }
}

// export connectDB;
module.exports = connectDB; 