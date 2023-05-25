const express = require('express');
const router = express.Router();
const Comment = require('../model/Comment');
const Post = require('../model/Posts');
const verify=require('../verifyToken');

// CREATE NEW COMMENT
router.post('/',verify, async (req, res) => {
  const { post, text, rating } = req.body;
    const user=req.user._id;
    const rate= Number(rating);
  try {
    const comment = new Comment({
      user,
      post,
      text,
      rate
    });

    await comment.save();
    // Find the post by ID and update the comments array and totalReviewScore field
    const updatedPost = await Post.findByIdAndUpdate( post,
        {
        $push: { comments: comment._id }, // add the comment ID to the comments array
        $inc: { totalreviewscore: rate }, // increment the totalReviewScore field by the rating value
        },{ new: true }
    ).populate('comments') 
    res.status(201).json({
      message: 'Comment created successfully!',
      updatedPost
    });
  } catch (err) {
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message
    });
  }
});

// EDIT COMMENT
router.patch('/:id',verify, async (req, res) => {
  const { text, rating } = req.body;
  const com =await Comment.findById(req.params.id);
  if (!com) {
      return res.status(404).send('Comment not found');
    }
  if(!(com.user==req.user._id)){
      return res.status(404).send('Not authorized to update this comment');
  }
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { text, rating }, { new: true });

    res.status(200).json({
      message: 'Comment updated successfully!',
      comment
    });
  } catch (err) {
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message
    });
  }
});

// DELETE COMMENT
// router.delete('/:id',verify, async (req, res) => {
//   try {
//     const comment = await Comment.findOneAndDelete({ _id:req.params.id,user:req.user._id});

//     if (!comment) {
//       return res.status(404).json({
//         message: 'Comment not found!'
//       });
//     }

//     res.status(200).json({
//       message: 'Comment deleted successfully!'
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: 'Something went wrong!',
//       error: err.message
//     });
//   }
// });
router.delete('/:id', verify, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found!'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAuthor = comment.user.equals(req.user._id);
    let isCreator=false;
    try{
      const parentPost= await Post.findById(comment.post)
      isCreator = parentPost.author.equals(req.user._id);
    }
    catch(err){
      return res.status(404).json({
        message: 'Cannot find the parent post'
      });
    }
    if (!(isAdmin || isAuthor || isCreator)) {
      return res.status(403).json({
        message: 'Not authorized to delete this comment!'
      });
    }

    await Comment.deleteOne({ _id: comment._id });

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
//GET A COMMENT BY ID
router.get('/:id', verify, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found!'
      });
    }

    res.status(200).json({
      message: 'Comment retrieved successfully!',
      comment: comment
    });
  } catch (err) {
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message
    });
  }
});



module.exports = router;
