const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  text: { type: String},
  rating: {
    type: Number,
    validate: function() {
      return this.text || this.rating;
    }
  }
},{ timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;