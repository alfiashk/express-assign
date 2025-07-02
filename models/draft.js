const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
  status: {
    type: String,
    default: 'draft'
  },

}, {timestamps: true});

module.exports = mongoose.model('Draft', draftSchema);
