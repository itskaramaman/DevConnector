const express = require('express'); // import express
const connectDB = require('./config/db'); // import the connectDB;

// initialize app variable with express
const app = express();

// connect database
connectDB();

// Init Middleware
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('API running')
})

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// look for an environment variable named PORT so when depoyed to heroku will look for it.
// if there is no environment varibale set it will run on port 5000
const PORT = process.env.PORT || 5000;

// make app listen on a port
app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`));