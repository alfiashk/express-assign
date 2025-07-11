const Post = require("../models/posts");
const User = require("../models/user");
const Draft = require("../models/draft");


const getAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 5, author, postDate } = req.query;
        const query = { status: "published" };
    
        if (author) {
            const user = await User.findOne({ username: author });
            // console.log(user);
          
            if (!user) {
                const error = new Error("No Author Found");
                error.status = 404;
                return next(error);
            } 
            
            query.author = user._id;
        }

        if (postDate) {
            const start = new Date(postDate);
            start.setHours(0, 0, 0, 0);
        
            const end = new Date(postDate);
            end.setHours(23, 59, 59, 999);
        
            query.createdAt = { $gte: start, $lte: end };
          }
    
        const posts = await Post.find(query)
            .populate("author", "-_id username ")
            .skip((parseInt(page) - 1) * (parseInt(limit)))
            .limit(parseInt(limit))
            .sort({ createdAt: 1 });
        
        if (posts.length === 0) {
            const error = new Error("No Posts available");
            error.status = 404;
            return next(error);
        }
    
        const total = await Post.countDocuments(query);
    
        res.status(200).json({
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          posts,
        });
       
    
      } catch (err) {
        const error = new Error("Error showing posts");
        error.status = 400;
        return next(error);
      }
    
};

const getSinglePosts = async (req, res, next) => {
    const id = req.params.id;
    try {
        let post = await Post.findById(id).populate("author", "-_id username");
    
        if (!post) {
          const error = new Error(`No posts available of id ${id}`);
          error.status = 400;
          return next(error);
        }
    
        res.status(200).json(post);

      } catch (err) {
        const error = new Error("Error showing post");
        error.status = 400;
        return next(error);
      }
}

const myPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 3 } = req.query;

        const query = { author: req.user.id };

        const posts = await Post.find(query)
        .populate("author", "username -_id")
        .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
        const drafts = await Draft.find(query).populate("author", "-_id username");

        const total = await Post.countDocuments(query);

        res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        posts,
        drafts
        });


    } catch (err) {
        const error = new Error("Something went wrong");
        error.status = 400;
        return next(error);
    }
}

const create = async (req, res, next) => {
    const { title, content, status } = req.body;
    try {
        const userId = req.user.id;
        if (!title || !content ) {
            const error = new Error('please include title and content. Also include status = published if you want to publish the post');
            error.status = 400;
            return next(error);
        }

            const newPost = await Post.create({
                title,
                content,
                publishAt : new Date(),
                status: status || "draft",
                author: userId
            });
            
            populatedPost = await Post.findById(newPost._id).populate("author", "username"); 
        
        res.status(200).json({ msg: "Blog created", blog: populatedPost });
    
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
       
    }
};

const publishPost = async (req, res, next) => {
    try {
      const id = req.params.id;
  
     
      let post = await Post.findById(id);
  
      if (post) {
        
        if (post.status === "published") {
          return res.status(400).json({ msg: "Post is already published" });
        }
  
        post.status = "published";
        post.publishAt = new Date();
        await post.save();
  
        const populated = await Post.findById(post._id).populate("author", "-_id username");
        return res.status(200).json({ msg: "Draft post published", post: populated });
      }
  
      
      const draft = await Draft.findById(id);
      if (!draft) {
        const error = new Error("No draft or post found with the provided ID");
        error.status = 404;
        return next(error);
      }
  
      
      post = await Post.findById(draft.postId);
      if (!post) {
        const error = new Error("Original post for this draft not found");
        error.status = 404;
        return next(error);
      }
  
     
      post.title = draft.title;
      post.content = draft.content;
      post.updatedAt = new Date();
      await post.save();
  
     
      await Draft.findByIdAndDelete(draft._id);
  
      const populated = await Post.findById(post._id).populate("author", "-_id username");
      return res.status(200).json({ msg: "Edited draft published to original post", post: populated });
  
    } catch (err) {
      const error = new Error("Error publishing post or draft");
      error.status = 400;
      return next(error);
    }
  };



  const updatePost = async (req, res, next) => {
    try {
      const { title, content } = req.body;
  
      if (!title && !content) {
        const error = new Error('Please provide a title or content to update.');
        error.status = 400;
        return next(error);
      }
  
      const post = await Post.findById(req.params.id);
      if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        return next(error);
      }
  
      if (post.status === "draft") {
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();
  
        const populated = await Post.findById(post._id).populate("author", "-_id username");
        return res.status(200).json({ msg: "Draft post updated", post: populated });
      }
  
      
      let draft = await Draft.findOne({ postId: post._id });
  
      if (!draft) {
        draft = new Draft({
          title: title || post.title,
          content: content || post.content,
          author: post.author,
          postId: post._id,
        });
      } else {
        draft.title = title || draft.title;
        draft.content = content || draft.content;
      }
  
      await draft.save();
      const populatedDraft = await Draft.findById(draft._id).populate("author", "-_id username");
      return res.status(200).json({ msg: "Changes saved as draft", draft: populatedDraft });
  
    } catch (err) {
      const error = new Error("Error updating post");
      error.status = 500;
      return next(error);
    }
};
  
const deletePost = async (req, res, next) => {
    const  id  = req.params.id;
    try {
        const post = await Post.findByIdAndDelete( id );
        if (!post) {
            const error = new Error("Post does not exists");
            error.status = 400;
            return next(error);
        }

        await Draft.findOneAndDelete({ postId: id });


        res.status(200).json({ msg: "Post Deleted!" });
    } catch (err) {
        const error = new Error("Error while deleting post!");
        error.status = 400;
        return next(error);
    }
    
};

module.exports = {
    create,
    updatePost,
    getAll,
    publishPost,
    deletePost,
    myPosts,
    getSinglePosts
}