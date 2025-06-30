const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const userController = require("../controller/user");
const isOwner = require("../middleware/verifyUser");


router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.put("/update/:username", verifyToken, isOwner, userController.updateUser);

module.exports = router;