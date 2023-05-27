const express = require('express');
const router = express.Router();
const Post = require('../model/Posts');
const FuzzySet = require('fuzzyset.js');


// post request to /search?q=<search-term>

router.post('/', async (req, res) => {
  const searchTerm = req.body.q;
  const threshold = 0.3; // adjust this to control the threshold for fuzzy matching
  if (!searchTerm ) {
    res.status(400).json({ message: 'Invalid search term' });
    return;
  }
  try {
  
    const fuzzySet = FuzzySet([searchTerm]);
    const results = await Post.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    const matchedResults = results.filter((result) => {
        const nameMatch = fuzzySet.get(result.name);
        const descriptionMatch = fuzzySet.get(result.description);
        return (
          nameMatch && nameMatch[0][0] >= threshold ||
          descriptionMatch && descriptionMatch[0][0] >= threshold 
        );
      });

    res.json(matchedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//filtering 
router.post('/filter', async (req, res) => {
    const cuisineTerm = req.body.cuisine;
    const courseTerm = req.body.course;
    const dietTerm = req.body.diet;
  
    try {
      let query = {};
  
      if (cuisineTerm) {
        query.cuisinecategory = { $in: cuisineTerm.split(',') };
      }
  
      if (courseTerm) {
        query.coursecategory = { $in: courseTerm.split(',') };
      }
  
      if (dietTerm) {
        query.dietcategory = { $in: dietTerm.split(',') };
      }
  
      const results = await Post.find({
        $or: [query]
      });
  
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
