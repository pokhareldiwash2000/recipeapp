const passport= require('passport');
const GoogleStrategy=require('passport-google-oauth20');
const Guser=require('../model/GoogleUser');


// passport.serializeUser((user,done)=>{
//     console.log('serialized')
//     done(null,user.id);
// })

// passport.deserializeUser((id,done)=>{
//     console.log('deserialized')
//     Guser.findById(id).then((user)=>{
//         done(null,user);
//     })
// })

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}
, async (accessToken,refreshToken,profile,done)=>{

    //check if user already exist
    Guser.findOne({googleId:profile.id}).then((currentUser)=>{
        if(currentUser){
            console.log('existing user');
            done(null,currentUser);
        }
        else{
              //create new user
            new Guser({
                name:profile.displayName,
                email:profile.emails[0].value,
                googleId:profile.id
            }).save().then((newUser)=>{
                console.log("new user created");
                done(null,newUser);
            });
        }
    });
  
   
}));