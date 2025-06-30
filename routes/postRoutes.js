const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const isOwner = require("../middleware/verifyUser");
const postController = require("../controller/post");

router.get("/allPosts", postController.getAll);
router.get("/myPosts", verifyToken, postController.myPosts);
router.get("/:id", postController.getSinglePosts);
router.post("/create", verifyToken, postController.create);
router.put("/update/:id", verifyToken,isOwner, postController.updatePost);
router.put("/publish/:id", verifyToken,isOwner, postController.publishPost);
router.delete("/:id", verifyToken, isOwner, postController.deletePost);


module.exports = router;