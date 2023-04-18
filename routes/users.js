
const router= require('express').Router();
const verify=require('../verifyToken');
const User=require('../model/User');
const Post=require('../model/Posts');
const Comment=require('../model/Comment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// PUT route to update user account details
router.put('/:id',verify, async (req, res) => {
  const { name, email, password ,photo} = req.body;
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.photo=photo ||user.photo;
    if (password) {
       //Hashing the password
        const salt= await bcrypt.genSalt(10);
        user.password= await bcrypt.hash(password,salt);
    }

    // Save updated user details
    const updatedUser = await user.save();
    updatedUser.password='';
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update this user' });
  }
});

// DELETE route to delete an user account 
router.delete('/:id',verify, async (req, res) => {
    
    try {
        const userId = req.params.id;
        const user= await User.findById(userId)
        try {
            await Comment.deleteMany({user:user._id})
            await Post.deleteMany({author:user._id})
            await User.findByIdAndDelete(userId);
            res.status(200).send("user has been deleted successfully")
        } catch (error) {
            res.staus(500).send(error);
        }

    } catch (error) {
        res.send("user not found");
    }
  });

// GET a user by ID
router.get('/:id', async (req, res) => {
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

//GET user profile info
router.get('/',verify, async (req, res) => {
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
  
// Set up Multer middleware to handle file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, './public/images');
    },
    filename: (req, file, callback) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      callback(null, fileName);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 5 * 2 // 25MB limit
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type.'));
    }
  }
});

// Route for uploading a user's profile picture
router.post('/profile-picture',verify, upload.single('photo'), async (req, res) => {
  
  const { filename } = req.file;
  try {
    // Find the user by ID
    const user = await User.findById(req.user._id);

    if (!user) {
      // Delete the uploaded file if the user doesn't exist
      fs.unlinkSync(path.join('./public/images', filename));
      return res.status(404).json({ message: 'User not found.' });
    }
    else if(!(user.photo=='')){
      fs.unlinkSync(path.join('./public', user.photo));
    }
    // Update the user's profile picture URL
    user.photo = `/images/${filename}`;

    // Save the updated user to the database
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
  
module.exports=router;