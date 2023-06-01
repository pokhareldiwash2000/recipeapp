const express = require('express');
const router = express.Router();
const Post = require('../model/Posts');
const Comment= require('../model/Comment')

// Route for popular posts (based on total reviews)
router.get('/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Post.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const popularPosts = await Post.find()
      .sort({ totalreviewscore:-1,rating: -1, totalReviews: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // .populate('comments');

    res.json({
      page,
      limit,
      totalPages,
      results: popularPosts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular posts' });
  }
});

// Route for trending posts (based on rating and recentness)
router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Post.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const trendingPosts = await Post.find()
      .sort({ rating: -1, date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // .populate('comments');

    res.json({
      page,
      limit,
      totalPages,
      results: trendingPosts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
});

// Route for new posts (based on createdAt)
router.get('/new', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Post.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const newPosts = await Post.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // .populate('comments');

    res.json({
      page,
      limit,
      totalPages,
      results: newPosts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch new posts' });
  }
});

// Route for most viewed posts (based on total views)
router.get('/most-viewed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCount = await Post.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const mostViewedPosts = await Post.find()
      .sort({ totalreviews: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      // .populate('comments');

    res.json({
      page,
      limit,
      totalPages,
      results: mostViewedPosts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch most viewed posts' });
  }
});

//Route for most interacted posts (based on total comments)
router.get('/most-interacted', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const [mostInteractedPosts, totalCount] = await Promise.all([
        Post.aggregate([
          { $sort: { rating: -1 } },
          { $limit: limit },
          { $skip: (page - 1) * limit },
          {
            $lookup: {
              from: 'comments',
              localField: 'comments',
              foreignField: '_id',
              as: 'comments',
            },
          },
          {
            $addFields: {
              commentCount: { $size: '$comments' },
            },
          },
          { $sort: { commentCount: -1 } },
        ]),
        Post.countDocuments(),
      ]);
  
      const totalPages = Math.ceil(totalCount / limit);
  
      res.json({
        page,
        limit,
        totalPages,
        results: mostInteractedPosts,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch most interacted posts' });
    }
  });
  
  
module.exports = router;
