//Imports
const express= require('express');
const cors = require('cors');
const mongoose= require('mongoose');
require('dotenv').config();
const bodyParser = require("body-parser");
// const cookieSession=require("cookie-session")
// const session = require('express-session');
const passport=require('passport');
const passportSetup=require('./config/passport-setup');

//inport routes
const authRoute=require('./routes/auth');
const postRoute=require('./routes/posts');
const userAccountRoute=require('./routes/users');
const mypostRoute=require('./routes/myposts')
const commentRoute=require('./routes/comments');
const adminRoute=require('./routes/admin');
const searchRoute=require('./routes/search');
const filterRoute=require('./routes/filter');


const app= express();

app.use(bodyParser.urlencoded({extended:true}));
// app.use(bodyParser.json());
//route middlewares
app.use('/api/user',authRoute);
app.use('/api/posts',postRoute);
app.use('/api/myposts',mypostRoute);
app.use('/api/account',userAccountRoute);
app.use('/api/comment',commentRoute);
app.use('/api/admin',adminRoute);
app.use('/api/search',searchRoute);
app.use('/api/filter',filterRoute);

Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE ,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, auth-token');
  next();
});
// app.use(cors());
//serving static files 
app.use(express.static('public'));
//middlewares
// app.use(session({
//   secret: process.env.COOKIE_KEY,
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());

//connecting to the database
const db=process.env.DB_CONNECTION;
mongoose
  .connect(db)
  .then(() => console.log("💻 Mondodb Connected"))
  .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send("Welcome to the recipe app. ");
});

app.listen(process.env.PORT,()=>{
    console.log(`server started at http://localhost:${process.env.PORT}`);
})
