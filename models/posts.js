const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  publishAt: { type: Date, default: null },
  
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },

}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);
