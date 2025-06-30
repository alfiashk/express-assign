const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) { 
    const error = new Error("No token Provided");
    error.status = 400;
    return next(error);
  } 
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    // console.log(req.user);
    next();
  } catch (err) {
      const error = new Error("Invalid Token");
      error.status = 400;
      return next(error)
  }
  
};

module.exports = verifyToken;