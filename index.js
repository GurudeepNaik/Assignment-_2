const express = require("express");
const mongoose = require("mongoose");
const Router = require("./Routes/routes");
const PostRouter = require("./Routes/PostRoute");
const bodyparser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
const myUser = require("./model/login");
const secret = "RESTAPI";

mongoose.connect("mongodb://localhost/assignment", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connection Sucess");
  }
});
app.use(bodyparser.json());
app.use("/posts", (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization;
    jwt.verify(token.toString(), secret, async (err, decoded) => {
      if (err) {
        res.status(400).json({
          status: "Failed",
          message: "authorization error",
          err,
        });
      } else {
        const data = await myUser.findOne({ _id: decoded.data });
        req.user = data._id;
        next();
      }
    });
  } else {
    res.status(400).json({
      status: "Failed",
      message: "invalid User",
      err,
    });
  }
});
app.use("/", Router);
app.use("/posts", PostRouter);

app.get("*", (req, res) => {
  res.status(400).json({
    status: "Failed",
    message: "Undefined Route",
  });
});

app.listen(3000, () => {
  console.log("App is Listning @ http://localhost:3000/");
});
