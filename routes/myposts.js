
const router= require('express').Router();
const verify=require('../verifyToken');
const multer = require("multer");
const User=require('../model/User')
const Post=require('../model/Posts')
const Comment= require('../model/Comment')
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

const storagePhoto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/media');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedImageTypes = ['image/jpeg', 'image/png','video/mp4','video/mov','video/avi'];

const fileFilterImage = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
  }
};

const uploadPhoto = multer({ storage: storagePhoto, fileFilter: fileFilterImage });

// Create a new post
router.post('/',
    verify,
     uploadPhoto.fields([{ name: 'photo', maxCount: 1 }, { name: 'stepsPhoto', maxCount: 10 },{ name: 'video', maxCount: 1 }]),
      async (req, res, next) => {
  
  const { name, description, servings, cookingTime, prepTime} = req.body;
  const author=req.user._id;
  const photo = req.files['photo'] ? `/media/${req.files['photo'][0].filename}` : '';
  const steps = [];
  if(req.body.ingredients){
    const ingred=req.body.ingredients.map(([name, quantity]) => ({ name, quantity }));
  req.body.ingredients=ingred;
  }
  if(req.body.steps){const stp=req.body.steps.map(name => ({ name }));
  req.body.steps=stp;}
  const ingredients=req.body.ingredients;
  const cuisinecategory= req.body.cuisinecategory?req.body.cuisinecategory:[];
  const coursecategory= req.body.coursecategory?req.body.coursecategory:[];
  const dietcategory= req.body.dietcategory?req.body.dietcategory:[];
  // console.log(req.body.steps);
  // req.body.steps=JSON.parse(req.body.steps);
  
  // const ingredients=JSON.parse(req.body.ingredients)

  if (req.body.steps && req.body.steps.length) {
    for (let i = 0; i < req.body.steps.length; i++) {
      const step = { name: req.body.steps[i].name };
      if (req.files['stepsPhoto'] && req.files['stepsPhoto'][i]) {
        step.photo = `/media/${req.files['stepsPhoto'][i].filename}`;
      }
      steps.push(step);
    }
  }
  const youtubeURL = req.body.youtubeURL || '';
  const video = req.files['video'] ? `/media/${req.files['video'][0].filename}`: '';
  
  const post = new Post({ author, name, description, photo, youtubeURL, servings, cookingTime, prepTime,ingredients, steps, cuisinecategory, coursecategory, dietcategory, video });
  try {
    const result = await post.save();
    res.status(201).json({ message: 'Post created successfully.', post: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});


// Update an existing post
router.patch('/:id',
    verify,
     uploadPhoto.fields([{ name: 'photo', maxCount: 1 }, { name: 'stepsPhoto', maxCount: 10 },{ name: 'video', maxCount: 1 }]),
      async (req, res, next) => {
  const postId = req.params.id;
  try{
    const p = await Post.findById(postId);
    if (!p) {
      return res.status(404).send('Post not found');
    }
    if (!(p.author == req.user._id)) {
      return res.status(404).send('Not authorized to update this post');
    }
    if(req.body.ingredients){
      const ingred=req.body.ingredients.map(([name, quantity]) => ({ name, quantity }));
    req.body.ingredients=ingred;
    }
    if(req.body.steps){const stp=req.body.steps.map(name => ({ name }));
    req.body.steps=stp;}
    const ingredients=req.body.ingredients?req.body.ingredients:p.ingredients;
    const cuisinecategory= req.body.cuisinecategory?req.body.cuisinecategory:p.cuisinecategory;
    const coursecategory= req.body.coursecategory?req.body.coursecategory:p.coursecategory;
    const dietcategory= req.body.dietcategory?req.body.dietcategory:p.dietcategory;

    req.body= Object.assign({}, p, req.body);
    const { 
      name, 
      description, 
      servings, 
      cookingTime, 
      prepTime, 
    } = req.body;
  
    const author=req.user._id;
    let photo = p.photo;
    if (req.files['photo']) {
      if(p.photo.length!==0){
        fs.unlink(`./public${p.photo}`, (err) => {
          if (err) {
            console.log(err);
            console.log("photo error")
          }
        });
      }
      photo = `/media/${req.files['photo'][0].filename}`;
    }
    let steps = p.steps;
    if (req.body.steps) {
      steps = [];
      // req.body.steps = JSON.parse(req.body.steps);
      if (req.body.steps.length) {
        for (let i = 0; i < req.body.steps.length; i++) {
          const step = { name: req.body.steps[i].name };
          if (req.files['stepsPhoto'] && req.files['stepsPhoto'][i]) {
            if(p.steps.length!==0){
              fs.unlink(`./public${p.steps[i].photo}`, (err) => {
                if (err) {
                  console.log(err);
                  console.log("stepsPhoto error")
                }
              });
            }
            step.photo = `/media/${req.files['stepsPhoto'][i].filename}`;
          } else {
            step.photo = p.steps[i].photo;
          }
          steps.push(step);
        }
      }
    }
    const youtubeURL = req.body.youtubeURL || p.youtubeURL;
    let video = p.video;
    if (req.files['video']) {
      if(p.video.length!==0){
        fs.unlink(`./public${p.video}`, (err) => {
          if (err) {
            console.log(err);
            console.log("video error")
          }
        });
      }
      video = `/media/${req.files['video'][0].filename}`;
    }
    
    try {
      const post = await Post.findByIdAndUpdate(postId, { author, name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, cuisinecategory, coursecategory, dietcategory, video }, { new: true });
      res.status(200).json({ message: 'Post updated successfully.', post: post });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: 'couldnot update post' });
    }
  }
  catch(err){
    res.status(500).json({ error: err });
  }
  
});

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

/* 
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
// router.patch('/:id', verify, async (req, res) => {
//   const postId = req.params.id;

//   try {
//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).send('Post not found');
//     }

//     if (!(post.author == req.user._id)) {
//       return res.status(404).send('Not authorized to update this post');
//     }

//     const updateFields = {
//       ...req.body,
//       author: post.author, // make sure to keep the author the same
//     };

//     const savedPost = await Post.findByIdAndUpdate(postId, { $set: updateFields }, { new: true });

//     res.send(savedPost);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to update post');
//   }
// });
 */

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
            const files = [];
            if (post.photo) {
              files.push(post.photo);
            }
            if (post.video) {
              files.push(post.video);
            }
            for (let i = 0; i < post.steps.length; i++) {
              if (post.steps[i].photo) {
                files.push(post.steps[i].photo);
              }
            }
            for (let i = 0; i < files.length; i++) {
              try {
                fs.unlinkSync(`./public${files[i]}`);
              } catch (err) {
                console.log(err);
              }
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
