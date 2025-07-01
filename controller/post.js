const Post = require("../models/posts");
const User = require("../models/user");

const getAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 5, author } = req.query;
        const query = { status: "published" };
    
        if (author) {
            console.log("Looking for author:", author);
            const user = await User.findOne({ username: author });
            // console.log(user);
          
            if (!user) {
                const error = new Error("No Author Found");
                error.status = 404;
                return next(error);
            } 
            
            query.author = user._id;
        }
    
        const posts = await Post.find(query)
            .populate("author", "username -_id")
            .skip((parseInt(page) - 1) * (parseInt(limit)))
            .limit(parseInt(limit));
        
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
        const { page = 1, limit = 3, startDate, endDate } = req.query;

        const query = { author: req.user.id };

        const posts = await Post.find(query)
        .populate("author", "username -_id")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        posts,
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
        if (!title || !content) {
            const error = new Error('please include title and content. Also include status = published to publish the post');
            error.status = 400;
            return next(error);
        }

        const publishAt = status === "published" ? new Date() : null;
        const newPost = await Post.create({
            title,
            content,
            publishAt,
            status: status || "draft",
            author: userId
        });

        const populatedPost = await Post.findById(newPost._id).populate("author", "-_id username");
        
        res.status(200).json({ msg: "Post created", post: populatedPost });
    
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
       
    }
};

const publishPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) { 
            const error = new Error("Post not found");
            error.status = 404;
            return next(error);
        } 
      
        post.status = "published";
        post.publishAt = new Date();
  
        await post.save();
        const populated = await Post.findById(post._id).populate("author", "-_id username");
  
        res.status(200).json({ msg: "Post published", populated });
  
    } catch (err) {
            const error = new Error("Error publishing the post!");
            error.status = 400;
            return next(error)
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, content, status } = req.body;
  
        const post = await Post.findById(req.params.id);
        if (!post) {
            const error = new Error("Post not found");
            error.status = 404;
            return next(error)
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.status = status || "draft";
        
  
        await post.save();
  
        const populated = await Post.findById(post._id).populate("author", "-_id username");
        res.status(200).json({ msg: "Post updated", post: populated });
  
    } catch (err) {
        const error = new Error("Error updating post");
        error.status = 400;
        return next(error)
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