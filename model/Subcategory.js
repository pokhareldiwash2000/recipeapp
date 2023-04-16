const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubcategorySchema = new mongoose.Schema({
   name:{
    type:String,
    default:''
   }
});

const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

module.exports = Subcategory;