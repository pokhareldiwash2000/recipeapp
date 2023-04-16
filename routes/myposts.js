
const router= require('express').Router();
const verify=require('../verifyToken');
const User=require('../model/User')
const Post=require('../model/Posts')
const Comment= require('../model/Comment')
const mongoose = require("mongoose");
//Get all post or get posts by sending query string cuisine=,diet=,course=,limit=
router.get('/',verify, async (req, res) => {
    const { cuisine, course, diet ,limit} = req.query;
    const query = {};
    query.author=req.user._id;
    if (cuisine) {
      query.cuisinecategory = { $in: [cuisine] };
    }
  
    if (course) {
      query.coursecategory = { $in: [course] };
    }
  
    if (diet) {
      query.dietcategory = { $in: [diet] };
    }
    try {
      const posts = await Post.find(query).populate('comments').limit(Number(limit));
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
// Get a post by ID
router.get('/:id',verify, async (req, res) => {
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

// Create a new post
router.post('/',verify, async (req, res) => {
  const { name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, cuisinecategory,coursecategory,dietcategory } = req.body;
    const author=req.user._id;
  const post = new Post({
    author,
    name,
    description,
    photo,
    youtubeURL,
    servings,
    cookingTime,
    prepTime,
    ingredients,
    steps,
    cuisinecategory,
    coursecategory,
    dietcategory
    
  });

  try {
    const savedPost = await post.save();
    res.send(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create post');
  }
});

// Update a post by ID
// router.put('/:id',verify, async (req, res) => {
//   const postId = req.params.id;

//   try {
//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).send('Post not found');
//     }
//     if(!(post.author==req.user._id)){
//         return res.status(404).send('Not authorized to update this post');
//     }
//     const { author, name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, cuisinecategory,coursecategory,dietcategory} = req.body;

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
//     post.cuisinecategory=cuisinecategory;
//     post.dietcategory=dietcategory;
//     post.coursecategory=coursecategory
//     const savedPost = await post.save();
//     res.send(savedPost);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to update post');
//   }
// });
// Update a post by ID
router.patch('/:id', verify, async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    if (!(post.author == req.user._id)) {
      return res.status(404).send('Not authorized to update this post');
    }

    const updateFields = {
      ...req.body,
      author: post.author, // make sure to keep the author the same
    };

    const savedPost = await Post.findByIdAndUpdate(postId, { $set: updateFields }, { new: true });

    res.send(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to update post');
  }
});

// Delete a post by ID
router.delete('/:id',verify, async (req, res) => {
  const postId = req.params.id;
  try {
        const post =await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
          }
        if(!(post.author==req.user._id)){
            return res.status(404).send('Not authorized to delete this post');
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

  


module.exports = router;
