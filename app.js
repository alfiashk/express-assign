const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGODB_URL;
const User = require("./models/user");
const Post = require("./models/posts");

const errorHandler = require("./middleware/error");
const notFound = require("./middleware/notFound");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");


main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("Something went wrong", err); 
    });

async function main() { 
    await mongoose.connect(MONGO_URL);
}

app.use(express.json());

//register
app.use("/user",userRoutes );

//login
app.use('/post',postRoutes );


//Error Handler
// app.use(notFound);
// app.use(errorHandler);

//root
app.get("/", (req, res) => {
    res.send("root is working");
});


app.listen(port, () => console.log(`listening to port ${port}`));