const User = require("../models/user");
const { validateEmail, validatePassword } = require('../services/validation');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/sendEmail");

const register = async (req, res, next) => {
    let { username, email, firstName, lastName, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            const error = new Error('user already exists');
            error.status = 400;
            return next(error);
        }
            
        if (!validateEmail(email)) {
            const error = new Error('Invalid email');
            error.status = 400;
            return next(error);
        }
        
        if (!validatePassword(password)) {
            const error = new Error('Password must have 1 uppercase, 1 special char, 1 number, min 6 chars');
            error.status = 400;
            return next(error);
        }
            
        // console.log(password);
        const hashedPass = await bcrypt.hash(password, 12);

        let newUser = await User.create({
            username,
            email,
            firstName,
            lastName,
            password: hashedPass,
        });

        // console.log(newUser);
        res.status(200).json({ msg: "registered successfully" });
    
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
    }
};

const login = async (req, res, next) => {
    let { loginId, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: loginId }, { username: loginId }]
        });
        if (!user) {
            const error = new Error('user does not exists');
            error.status = 400;
            return next(error);
        }
        
        // console.log(user);
        
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            const error = new Error('Invalid password');
            error.status = 400;
            return next(error);
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
        }, process.env.SECRET, { expiresIn: "3d" });

        // console.log(token)
        res.status(200).json({ msg: "Login successful!" ,token: token});

    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
    }
};


//forgot-password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('No user with that email');
            error.status = 400;
            return next(error);
        }
  
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
  
      const resetLink = `http://localhost:3000/user/reset-password/${token}`;
      const html = `<h3>Reset your password</h3><p>Click the link below:</p><a href="${resetLink}">${resetLink}</a>`;
  
      await sendEmail(user.email, "Password Reset Request", html);
        
      res.status(200).json({ msg: "Reset token generated", token });
  
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
    }
};
  
//reset-password
const resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
  
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // not expired
        });
  
        if (!user) {
            const error = new Error('user does not exists');
            error.status = 400;
            return next(error);
        }
        
        if (newPassword !== confirmPassword) {
            const error = new Error('Password does not match!');
            error.status = 400;
            return next(error);
        }
            
        const hashed = await bcrypt.hash(newPassword, 12);
        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
  
        res.status(200).json({ msg: "Password reset successful" });
  
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
    }
};

//update user
const updateUser = async (req, res, next) => {
    const { username } = req.params;
    const { firstName, lastName, email, newUsername } = req.body;
    
    if (!firstName || !lastName || !email || !newUsername) {
        const error = new Error('Please enter the field u want to update: newUsername, email, firstName, lastName');
        error.status = 400;
        return next(error);
    }
      
    try {
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (email) updateFields.email = email;
        if (newUsername) updateFields.username = newUsername;
  
        const updatedUser = await User.findOneAndUpdate(
            { username },
            { $set: updateFields },
            { new: true }
        );
  
        if (!updatedUser) {
            const error = new Error('user does not exists');
            error.status = 400;
            return next(error);
        }
        res.status(200).json({ msg: "User updated successfully", user: updatedUser });
    
    } catch (err) {
        const error = new Error(err.message);
        error.status = 400;
        return next(error);
       
    }
};


module.exports = {
    register,
    login,
    updateUser,
    forgotPassword,
    resetPassword
}