const Post = require("../models/posts");
const Draft = require("../models/draft");



const isOwner = async (req, res, next) => {
  try {

    let doc = await Post.findById(req.params.id);
    
    if (!doc) { 
      doc = await Draft.findById(req.params.id);
    }

    if (!doc) {
      const error = new Error("Post or Draft not found");
      error.status = 404;
      return next(error);
    }


      if (doc.author.toString() !== req.user.id) {
          const error = new Error("Unauthorized User");
          error.status = 400;
          return next(error);
      }
      
    next();
  } catch (err) {
    const error = new Error("Server Error");
    error.status = 500;
    return next(error);
    }
    
};

module.exports = isOwner;
