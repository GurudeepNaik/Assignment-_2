const express = require("express");
const Router = express.Router();
const myUser = require("../model/login");
const { body, validationResult } = require("express-validator");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
var jwt = require("jsonwebtoken");
const secret = "RESTAPI";

app.use(express.json());
app.use(bodyparser.json());

Router.post(
  "/register",
  body("name").isAlpha(),
  body("email").isEmail(),
  body("password"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: "Failed By Validator",
          message: errors.array(),
        });
      } else {
        const { name, email, password } = req.body;
        bcrypt.hash(password, 10, async (err, hash) => {
          if (err) {
            res.status(500).json({
              status: "Failed in Password",
              message: err.message,
            });
          } else {
            const userData = await myUser.create({
              name: name,
              email: email,
              password: hash,
            });
            res.status(200).json({
              status: "Sucess",
              message: userData,
            });
          }
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

Router.post("/login", body("email"), body("password"), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        status: "Failed By Validator",
        message: errors.array(),
      });
    } else {
      const { email, password } = req.body;
      const userData = await myUser.findOne({ email });
      if (!userData) {
        res.status(400).json({
          status: "Failed",
          message: "User is Not Registered",
        });
      } else {
        bcrypt.compare(password, userData.password, (err, result) => {
          if (err) {
            res.status(500).json({
              status: "Failed in password",
              message: err.message,
            });
          } else {
            console.log(userData._id);
            if (result) {
              const token = jwt.sign(
                {
                  exp: Math.floor(Date.now() / 1) + 60 * 60,
                  data: userData._id,
                },
                secret
              );
              res.status(200).json({
                status: "Sucess",
                message: "You Are Logged In",
                token: token,
              });
            } else {
              res.status(200).json({
                status: "Failed",
                message: "Wrong Password",
              });
            }
          }
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
});
module.exports = Router;
