const router= require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User= require('../model/User');
const Post= require('../model/Posts');
const Comment= require('../model/Comment');
const GUser= require('../model/GoogleUser');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const verify=require('../verifyToken');
const admin=require('../verifyAdmin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

router.get('/',verify,admin,(req,res)=>{
    res.send("Bonjour!! you are in admin ");
});

// Registering a new admin with name, email and password
router.post('/register', verify,admin, async function (req, res) {

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
        password: hashPassword,
        role:'admin'
    });

    //Saving the new user to DB
    try {
        const savedUser = await user.save() ;
        return res.send({
            name: savedUser.name,
            _id:savedUser._id,
            role:savedUser.role
        });
    } catch (error) {
        return res.status(400).send({ message: error });
    }
});

// GET a user by id
router.get('/finduser/:id', verify,admin,async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
      const{password,...others}=user._doc
      res.send({user:others});
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to get user information');
    }
  });

//GET own profile info
router.get('/findme',verify,admin, async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
      const{password,...others}=user._doc
      res.send({user:others});
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to get user information');
    }
  });

// GET a user by email
router.get('/finduser', verify,admin,async (req, res) => {
    const userEmail = req.query.email;
  
    try {
      const user = await User.findOne({email:userEmail});
  
      if (!user) {
        return res.status(404).send('User not found');
      }
      const{password,...others}=user._doc
      res.send({user:others});
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to get user information');
    }
});

// DELETE route to delete an user account 
router.delete('/deleteuser/:id',verify,admin, async (req, res) => {
    
    try {
        const userId = req.params.id;
        const user= await User.findById(userId)
        try {
            await Post.deleteMany({author:user._id})
            await Comment.deleteMany({user:user._id})
            await User.findByIdAndDelete(userId);
            res.status(200).send("user has been deleted successfully")
        } catch (error) {
            res.staus(500).send(error);
        }

    } catch (error) {
        res.send("user not found");
    }
});
// DELETE COMMENT
router.delete('deletecomment/:id',verify,admin, async (req, res) => {
    try {
      const comment = await Comment.findOneAndDelete({ _id:req.params.id});
  
      if (!comment) {
        return res.status(404).json({
          message: 'Comment not found!'
        });
      }
  
      res.status(200).json({
        message: 'Comment deleted successfully!'
      });
    } catch (err) {
      res.status(500).json({
        message: 'Something went wrong!',
        error: err.message
      });
    }
  });
// Delete a post by post ID
router.delete('deletepost/:id',verify,admin, async (req, res) => {
    const postId = req.params.id;
    try {
          const post =await Post.findById(postId);
          if (!post) {
              return res.status(404).send('Post not found');
            }
          try {
              await Comment.deleteMany({post:postId})
              const deletedPost = await Post.findByIdAndDelete(postId);
              if (!deletedPost) {
              return res.status(404).send('Post not found');
              }
          
              res.send(deletedPost);
          } catch (error) {
              console.error(error);
              res.status(500).send('Failed to delete post');
          }
    } catch (error) {
      console.error(error);
      
    }
  });



//All of the code below are for the admin to manage the static photo and video resources in the website  
  
// Set up storage engine for photos
const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/photos'); // where uploaded photos will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
  
// Set up storage engine for videos
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/videos'); // where uploaded videos will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
  
// Set up multer for photo uploads
const uploadPhoto = multer({
    storage: photoStorage,
    limits: { fileSize: 20000000 }, // maximum file size in bytes (20MB)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // allowed file types for photos
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
        return cb(null, true);
        } else {
        cb('Error: Only images are allowed for photos!');
        }
    },
}).single('photo'); // field name for uploading photos
  
// Set up multer for video uploads
const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100000000 }, // maximum file size in bytes (100MB)
    fileFilter: (req, file, cb) => {
        const filetypes = /mp4|mov|avi/; // allowed file types for videos
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
        return cb(null, true);
        } else {
        cb('Error: Only videos are allowed for videos!');
        }
    },
}).single('video'); // field name for uploading videos
  
// Route for uploading photos
router.post('/upload/photo',verify,admin, (req, res) => {
    uploadPhoto(req, res, (err) => {
        if (err) {
        res.status(400).json({ message: err });
        } else {
        res.status(200).json({ message: 'Photo uploaded successfully!' });
        }
    });
});
  
// Route for uploading videos
router.post('/upload/video',verify,admin, (req, res) => {
    uploadVideo(req, res, (err) => {
        if (err) {
        res.status(400).json({ message: err });
        } else {
        res.status(200).json({ message: 'Video uploaded successfully!' });
        }
    });
});
  
// Route for deleting photos
router.delete('/remove/photo/:filename',verify,admin, (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname,'..', 'public', 'uploads', 'photos', filename); // path to the photo to be deleted

    fs.unlink(filepath, (err) => {
    if (err) {
    res.status(400).json({ message: err });
    } else {
    res.status(200).json({ message: 'Photo deleted successfully!' });
    }
    });
});
// Route for deleting videos
router.delete('/remove/video/:filename',verify,admin, (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname,'..', 'public', 'uploads', 'videos', filename); // path to the video to be deleted

    fs.unlink(filepath, (err) => {
    if (err) {
    res.status(400).json({ message: err });
    } else {
    res.status(200).json({ message: 'Video deleted successfully!' });
    }
    });
});

// Route for getting a list of uploaded photos
router.get('/photos', (req, res) => {
    const photosDir = path.join(__dirname,'..', 'public', 'uploads', 'photos');
    fs.readdir(photosDir, (err, files) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const photos = files.map((file) => {
          return {
            filename: file,
            url: `/uploads/photos/${file}`,
          };
        });
        res.status(200).json({ photos });
      }
    });
  });
  
  // Route for getting a list of uploaded videos
  router.get('/videos', (req, res) => {
    const videosDir = path.join(__dirname,'..', 'public', 'uploads', 'videos');
    fs.readdir(videosDir, (err, files) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const videos = files.map((file) => {
          return {
            filename: file,
            url: `/uploads/videos/${file}`,
          };
        });
        res.status(200).json({ videos });
      }
    });
  });
  

  
module.exports=router;
