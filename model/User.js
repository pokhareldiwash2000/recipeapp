const { string } = require("@hapi/joi");
const mongoose = require("mongoose");

// const userSchema= new mongoose.Schema({
//     name:{
//         type: String,
//         required:true,
//         min:2,
//         max:255
//     },
//     email:{
//         type:String,
//         required: true,
//         min:6,
//         max:255
//     },
//     password:{
//         type:String,
//         required:true,
//         min:6,
//     },
//     date:{
//         type:Date,
//         default:Date.now
//     },
//     photo:{
//         type:String,
//         default:''
//     }
// });

// define the base schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        min:2,
        max:255
    },
    email:{
        type:String,
        required: true,
        min:6,
        max:255
    },
    photo:{
        type:String,
        default:''
    },
    date:{
        type:Date,
        default:Date.now
    },
    discriminator: {
        type: String,
        required: true,
        enum: ['OurUser', 'GoogleUser'],
        default: 'OurUser',
      },
      role: {
        type: String,
        enum: ['basic', 'admin'],
        default: 'basic',
      }
    
}, { discriminatorKey: 'discriminator' });

const OurUserSchema = new mongoose.Schema({
    password:{
        type:String,
        required:true,
        min:6,
    }

});

const GoogleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
});

userSchema.discriminator('OurUser', OurUserSchema);
userSchema.discriminator('GoogleUser', GoogleUserSchema);

module.exports =  mongoose.model('User', userSchema);
