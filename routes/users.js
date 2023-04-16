
const router= require('express').Router();
const verify=require('../verifyToken');
const User=require('../model/User');
const Post=require('../model/Posts');
const bcrypt = require('bcryptjs');

// PUT route to update user account details
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    
    try {
        const userId = req.params.id;
        const user= await User.findById(userId)
        try {
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


module.exports=router;