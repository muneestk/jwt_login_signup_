const express = require('express')

const mongoose = require("mongoose");

const cors = require('cors')

const cookieParser = require('cookie-parser') 

const routes = require('./routes/userRoutes')


const app = express()

app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}))

app.use(cookieParser())

app.use(express.json())

app.use("/api",routes)


mongoose.connect("mongodb://127.0.0.1:27017/angularminiproject", {}).then(() => {
    console.log('Connected to the database');

    app.listen(5000, () => {
        console.log("App is running on port 5000");
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});

