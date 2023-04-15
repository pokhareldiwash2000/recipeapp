const router= require('express').Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User= require('../model/User');
const GUser= require('../model/GoogleUser');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');

router.get('/',(req,res)=>{
    res.send("Bonjour!!");
});

// Registering a new user with name, email and password
router.post('/register', async function (req, res) {

    //validating the request first
    const validation=registerValidation(req.body);
    if(validation.error){ return res.status(400).send({ message: validation.error.details[0].message });}

    //checking if the email already exist
    const emailExist= await User.findOne({email:req.body.email});
    if(emailExist){    return res.status(400).send({ message: 'email already exists' });}

    //Hashing the password
    const salt= await bcrypt.genSalt(10);
    const hashPassword= await bcrypt.hash(req.body.password,salt);

    //creating new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    //Saving the new user to DB
    try {
        const savedUser = await user.save() ;
        return res.send({
            name: savedUser.name,
            _id:savedUser._id
        });
    } catch (error) {
        return res.status(400).send({ message: error });
    }
});

//Loging in user with email and password
router.post('/login',async function(req,res){
    //validating the request body
    const validation= loginValidation(req.body);
    if(validation.error) return res.status(400).send({ message: validation.error.details[0].message });

    //checking if the user exist
    const user= await User.findOne({email:req.body.email});
    if(!user){    return res.status(400).send({ message: 'Incorrect email or password' });}

    //verification: Password comparision
    const validPass= await bcrypt.compare(req.body.password,user.password);
    if(!validPass){return res.status(400).send({ message: 'Incorrect password' });}

    //create and assign a token
    const token =jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
    res.header('auth-token',token).send({message:'Success',user:{name:user.name,_id:user._id,accessToken:token}});

    // return res.status(200).send({ message: 'Success' });

    
});

// Route to logout (invalidate JWT token)
router.post('/logout', (req, res) => {
    // Get the JWT token from the request header
    const token = req.headers['auth-token'];
  
    // Check if the token is valid and not revoked
    if (!token || isTokenRevoked(token)) {
      return res.sendStatus(401);
    }
  
    // Add the token to the revocation list
    revokeToken(token);
  
    // Send response
    res.sendStatus(200);
  });
  
  // In-memory store to keep track of revoked tokens
  const revokedTokens = {};
  // Function to revoke a token
  function revokeToken(token) {
    // Add token to revocation list with short expiration time
    const expirationTime = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
    revokedTokens[token] = expirationTime;
  }
  // Function to check if a token is revoked
  function isTokenRevoked(token) {
    // Check if token is in the revocation list and not expired
    return token in revokedTokens && revokedTokens[token] >= Math.floor(Date.now() / 1000);
  }
  
//google login

router.get("/auth/google",passport.authenticate('google',{scope:['profile','email']}));

router.get("/auth/google/callback", passport.authenticate('google',{ session: false }),(req, res) => {
 //create and assign a token
 const token =jwt.sign({_id:req.user._id},process.env.TOKEN_SECRET);
 res.header('auth-token',token).send({message:'Success',user:{name:req.user.name,_id:req.user._id,accessToken:token}});
});



  
module.exports=router;
