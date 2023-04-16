const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new mongoose.Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    cuisine:[ { type: Schema.Types.ObjectId, ref: 'Subcategory' }],
    diet:[ { type: Schema.Types.ObjectId, ref: 'Subcategory' }],
    occassion:[ { type: Schema.Types.ObjectId, ref: 'Subcategory' }],
    course:[ { type: Schema.Types.ObjectId, ref: 'Subcategory' }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;