const validateEmail = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};
  

module.exports = {
    validateEmail,
  validatePassword
};
  