const Post = require("../models/posts");

const isOwner = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
      if (!post) { 
          const error = new Error("Post not Found");
          error.status = 404;
          return next(error);
      }

      if (post.author.toString() !== req.user.id) {
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
