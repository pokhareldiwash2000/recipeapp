const router= require('express').Router();
const Post=require('../model/Posts')
const mongoose = require("mongoose");
const fuzzySearching = require('mongoose-fuzzy-searching');


router.get("/", (req, res) => {
  res.send("No query")
});





module.exports = router;