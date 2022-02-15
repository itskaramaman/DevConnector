const express = require('express'); // import express
const connectDB = require('./config/db'); // import the connectDB;

// initialize app variable with express
const app = express();

// connect database
connectDB();

app.get('/', (req, res)=>{
    res.send('API running')
})

// look for an environment variable named PORT so when depoyed to heroku will look for it.
// if there is no environment varibale set it will run on port 5000
const PORT = process.env.PORT || 5000;

// make app listen on a port
app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`));