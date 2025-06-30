const validateEmail = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};
  
const checkUserId = (post, userId) => {
  return post.author.toString() === userId;
};
  
module.exports = {
    validateEmail,
    validatePassword
};
  