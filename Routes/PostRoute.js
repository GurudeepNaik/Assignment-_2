const postData = require("../model/post");
const express = require("express");
const Router = express.Router();
const { body, validationResult } = require("express-validator");
const bodyparser = require("body-parser");
const app = express();

app.use(express.json());
app.use(bodyparser.json());

Router.get("/", async (req, res) => {
  try {
    const post = await postData.find();
    res.status(200).json({
      status: "Sucess",
      post,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
});
Router.post(
  "/",
  body("title"),
  body("body"),
  body("image"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: "Failed By Validator",
          message: errors.array(),
        });
      } else {
        const post = await postData.create({
          title: req.body.title,
          body: req.body.body,
          image: req.body.image,
          user: req.user,
        });
        res.status(200).json({
          status: "Sucess",
          post,
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "Failed",
        message: err.message,
      });
    }
  }
);

Router.put("/:id", async (req, res) => {
  try {
    const post = await postData.find({ user: req.user }).updateOne(
      { _id: req.params.id },
      {
        title: req.body.title,
        body: req.body.body,
        image: req.body.image,
        user: req.user,
      }
    );
    if (post.modifiedCount === 0) {
      res.status(200).json({
        status: "There is No Posts Of that id",
      });
    } else {
      res.status(200).json({
        status: "Sucess",
        post,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
});

Router.delete("/:id", async (req, res) => {
  try {
    const post = await postData
      .find({ user: req.user })
      .deleteOne({ _id: req.params.id });
    console.log(post);
    if (post.deletedCount === 0) {
      res.status(200).json({
        status: "There is No Posts Of that id",
      });
    } else {
      res.status(200).json({
        status: "Sucess",
        post,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
});
module.exports = Router;
