
const router= require('express').Router();
const verify=require('../verifyToken');
const User=require('../model/User')
const Post=require('../model/Posts')
const mongoose = require("mongoose");
//Get all post or get posts by sending query string cuisine=,diet=,course=,limit=
router.get('/', async (req, res) => {
    const { cuisine, course, diet ,limit} = req.query;
    const query = {};
  
    if (cuisine) {
        if(cuisine !=='any') query.cuisinecategory = { $in: [cuisine] };
    }
  
    if (course) {
      query.coursecategory = { $in: [course] };
    }
  
    if (diet) {
      query.dietcategory = { $in: [diet] };
    }
  
    try {
      const posts = await Post.find(query).limit(Number(limit)).populate('comments');
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
// Get a post by ID
router.get('/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findByIdAndUpdate(postId, { $inc: { totalreviews: 1 } }, { new: true }).populate('comments');
    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to get post information');
  }
});

// // Create a new post
// router.post('/',verify, async (req, res) => {
//   const { name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, cuisinecategory,coursecategory,dietcategory } = req.body;
//     const author=req.user._id;
//   const post = new Post({
//     author,
//     name,
//     description,
//     photo,
//     youtubeURL,
//     servings,
//     cookingTime,
//     prepTime,
//     ingredients,
//     steps,
//     cuisinecategory,
//     coursecategory,
//     dietcategory
    
//   });

//   try {
//     const savedPost = await post.save();
//     res.send(savedPost);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to create post');
//   }
// });

// // Update a post by ID
// router.put('/:id', async (req, res) => {
//   const postId = req.params.id;

//   try {
//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).send('Post not found');
//     }

//     const { author, name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, category } = req.body;

//     post.author = author;
//     post.name = name;
//     post.description = description;
//     post.photo = photo;
//     post.youtubeURL = youtubeURL;
//     post.servings = servings;
//     post.cookingTime = cookingTime;
//     post.prepTime = prepTime;
//     post.ingredients = ingredients;
//     post.steps = steps;
//     post.category = category;

//     const savedPost = await post.save();
//     res.send(savedPost);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to update post');
//   }
// });

// // Delete a post by ID
// router.delete('/:id', async (req, res) => {
//   const postId = req.params.id;

//   try {
//     const deletedPost = await Post.findByIdAndDelete(postId);

//     if (!deletedPost) {
//       return res.status(404).send('Post not found');
//     }

//     res.send(deletedPost);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to delete post');
//   }
// });

  


module.exports = router;
