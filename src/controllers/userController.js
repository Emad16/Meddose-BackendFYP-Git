const passport = require("passport");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
var mongoose = require("mongoose");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";

//------------ User Model ------------//
const crypto = require("crypto");
const AWS = require("aws-sdk");
const User = require("../models/User");
AWS_S3_BUCKET = "knotsandvows";

const Categories = require("../models/Categories");
const { response } = require("express");
const Reviews = require("../models/Review");
const Requests = require("../models/Request");

const s3 = new AWS.S3({
  region: "ap-south-1",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  signatureVersion: "v4",
});

//------------ Register Handle ------------//
exports.getPatientsWithoutCareTakers = (req, res) => {
  User.find({ userType: "patient", careTaker: null }).then((user) => {
    return res.json(user);
  });
};

exports.getPatients = (req, res) => {
  User.find({ userType: "patient" })
    .sort({ createdAt: -1 })
    .then((user) => {
      return res.json(user);
    });
};

exports.getPatientsByCaretaker = (req, res) => {
  User.find({ userType: "patient", careTaker: req.query.id }).then((user) => {
    return res.json(user);
  });
};

exports.getCaretakers = (req, res) => {
  User.find({ userType: "caretaker" }).then((user) => {
    return res.json(user);
  });
};

exports.getPatientsByList = async (req, res) => {
  console.log(req.query.pateintList, "req.query.id");
  const userIds = JSON.parse(req.query.pateintList);
  const patients = [];
  const userDetails = await User.aggregate([
    {
      $match: {
        _id: { $in: userIds.map((id) => mongoose.Types.ObjectId(id)) },
      },
    },
    // Add additional pipeline stages if needed
  ]);

  return res.json(userDetails);
  return res.json({ success: true, patients });
  // User.find({ userType: "lawyer" })
  //   .populate("category")
  //   .exec()
  //   .then((user) => {
  //     return res.json(user);
  //   });
};

exports.getCaretakerById = (req, res) => {
  console.log(req.query.id, "req.query.id");
  User.findOne({ _id: req.query.id }).then((user) => {
    return res.json(user);
  });
};

exports.getReviewById = (req, res) => {
  Reviews.find({ recieverID: req.query.id })
    .populate("reviewerID")
    .exec()
    .then((user) => {
      return res.json(user);
    });
};

exports.getReviews = (req, res) => {
  Reviews.find()
    .sort({ createdAt: -1 })
    .limit(7)
    .populate(["reviewerID", "recieverID"])
    .exec()
    .then((user) => {
      return res.json(user);
    });
};

exports.getLawyerByCategory = (req, res) => {
  User.find({ category: req.query.categoryid })
    .populate("category")
    .exec()
    .then((user) => {
      return res.json(user);
    });
};

exports.approveUser = async (req, res) => {
  console.log(req.query);
  const result = await User.findByIdAndUpdate(
    { _id: req.query.id },
    { approved: true },
    { new: true }
  );

  if (!result) {
    res.json({ error: true, message: "user not found" });
  } else {
    res.json({
      error: false,
      message: "User Approved Successfully",
    });
  }
};

exports.s3Url = async (req, res) => {
  // const signer = new S3RequestPresigner({
  //   ...s3.config,
  // });
  const rawBytes = await generateRandomBytes(16);
  const imageName = rawBytes.toString("hex");

  console.log(req.query, "req.query");
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageName,
    Expires: 60,
    Metadata: { "x-amz-meta-type": req.query.type },
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return res.json({ url: uploadURL });
};

exports.getImageDetails = async (req, res) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: req.query.key,
  };

  // Make the HEAD Object request
  s3.headObject(params, (err, data) => {
    if (err) {
      console.error("Error:", err);
      return res.json({ error: true, message: err.message });
    } else {
      // Access metadata in the 'data' object
      return res.json({ error: false, message: "Success", data: data });

      console.log("Content Type:", data.ContentType);
      console.log("Content Length:", data.ContentLength);
      console.log("Last Modified:", data.LastModified);
      // Add more fields as needed
    }
  });
};

const generateRandomBytes = (length) => {
  return crypto.randomBytes(length);
};

exports.updateUser = async (req, res) => {
  const result = await User.findOneAndUpdate(
    { _id: req.body.id },
    { $set: req.body },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data!");
      }

      console.log(doc);
    }
  );
  return res.json({
    success: true,
    message: "user updated successfully",
    data: result,
  });
};

//------------ Activate Account Handle ------------//
exports.handleCategory = async (req, res) => {
  try {
    const newCategory = new Categories({
      name: req.body.name,
      description: req.body.description,
    });
    newCategory
      .save()
      .then((category) => {
        res.json({ error: false, category });
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;
    const oauth2Client = new OAuth2(
      "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
      "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
      refresh_token:
        "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
    });
    const accessToken = oauth2Client.getAccessToken();

    const output = `
                <h2>Hi! ${fullName}</h2>
                <p>Our Maddose team will contact you as soon as possible via email</p>
                <h3>Your Message</h3>
                <p>${message}</p>
                `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "nodejsa@gmail.com",
        clientId:
          "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
        clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
        refreshToken:
          "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
        accessToken: accessToken,
      },
    });

    // send mail with defined transport object
    const mailOptions = {
      from: '"Maddose" <contactus@maddose.com>', // sender address
      to: email, // list of receivers
      subject: "Thank you for contacting Maddose", // Subject line
      generateTextFromHTML: true,
      html: output, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(404).json({
          message: "Something went wrong on our end. Please try again.",
          error: true,
        });
      } else {
        console.log("Mail sent : %s", info.response);

        return res.status(200).json({
          message: "Our team will contact you soon",
          error: false,
        });
      }
    });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
};

exports.handleReview = async (req, res) => {
  try {
    const newReview = new Reviews({
      reviewerID: req.body.reviewerID,
      review: req.body.review,
      recieverID: req.body.recieverID,
      rating: req.body.rating,
    });
    newReview
      .save()
      .then((review) => {
        res.json({ error: false, review });
      })
      .catch((err) => res.json({ error: true, message: err.message }));
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  console.log(req.body);
  const result = await Categories.findOneAndUpdate(
    { _id: req.body.id },
    { $set: { ...req.body } },
    { new: true }
  );
  console.log(result);
  if (!result) {
    return res.json({
      error: true,
      message: "category not found",
    });
  }
  return res.json({
    error: false,
    message: "category updated successfully",
    data: result,
  });
};

exports.deleteCategory = async (req, res) => {
  const result = await Categories.findOneAndDelete({
    _id: mongoose.Types.ObjectId(req.body.id),
  });
  console.log(result);
  if (!result) {
    return res.json({
      error: true,
      message: "category not found",
    });
  }
  return res.json({
    error: false,
    message: "category deleted successfully",
    data: result,
  });
};

exports.getCategory = (req, res) => {
  Categories.find().then((category) => {
    return res.json(category);
  });
};

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  let errors = [];

  //------------ Checking required fields ------------//
  if (!email) {
    errors.push({ msg: "Please enter an email ID" });
  }

  if (errors.length > 0) {
    res.render("forgot", {
      errors,
      email,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        //------------ User already exists ------------//
        errors.push({ msg: "User with Email ID does not exist!" });
        res.render("forgot", {
          errors,
          email,
        });
      } else {
        const oauth2Client = new OAuth2(
          "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
          "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
          "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
          refresh_token:
            "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
        });
        const accessToken = oauth2Client.getAccessToken();

        const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, {
          expiresIn: "30m",
        });
        const CLIENT_URL = "http://" + req.headers.host;
        const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                `;

        User.updateOne({ resetLink: token }, (err, success) => {
          if (err) {
            errors.push({ msg: "Error resetting password!" });
            res.render("forgot", {
              errors,
              email,
            });
          } else {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                type: "OAuth2",
                user: "nodejsa@gmail.com",
                clientId:
                  "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                refreshToken:
                  "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                accessToken: accessToken,
              },
            });

            // send mail with defined transport object
            const mailOptions = {
              from: '"Auth Admin" <nodejsa@gmail.com>', // sender address
              to: email, // list of receivers
              subject: "Account Password Reset: NodeJS Auth ✔", // Subject line
              html: output, // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                req.flash(
                  "error_msg",
                  "Something went wrong on our end. Please try again later."
                );
                res.redirect("/auth/forgot");
              } else {
                console.log("Mail sent : %s", info.response);
                req.flash(
                  "success_msg",
                  "Password reset link sent to email ID. Please follow the instructions."
                );
                res.redirect("/auth/login");
              }
            });
          }
        });
      }
    });
  }
};

//------------ Redirect to Reset Handle ------------//
exports.gotoReset = (req, res) => {
  const { token } = req.params;

  if (token) {
    jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
      if (err) {
        req.flash("error_msg", "Incorrect or expired link! Please try again.");
        res.redirect("/auth/login");
      } else {
        const { _id } = decodedToken;
        User.findById(_id, (err, user) => {
          if (err) {
            req.flash(
              "error_msg",
              "User with email ID does not exist! Please try again."
            );
            res.redirect("/auth/login");
          } else {
            res.redirect(`/auth/reset/${_id}`);
          }
        });
      }
    });
  } else {
    console.log("Password reset error!");
  }
};

exports.resetPassword = (req, res) => {
  var { password, password2 } = req.body;
  const id = req.params.id;
  let errors = [];

  //------------ Checking required fields ------------//
  if (!password || !password2) {
    req.flash("error_msg", "Please enter all fields.");
    res.redirect(`/auth/reset/${id}`);
  }

  //------------ Checking password length ------------//
  else if (password.length < 8) {
    req.flash("error_msg", "Password must be at least 8 characters.");
    res.redirect(`/auth/reset/${id}`);
  }

  //------------ Checking password mismatch ------------//
  else if (password != password2) {
    req.flash("error_msg", "Passwords do not match.");
    res.redirect(`/auth/reset/${id}`);
  } else {
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err) throw err;
        password = hash;

        User.findByIdAndUpdate(
          { _id: id },
          { password },
          function (err, result) {
            if (err) {
              req.flash("error_msg", "Error resetting password!");
              res.redirect(`/auth/reset/${id}`);
            } else {
              req.flash("success_msg", "Password reset successfully!");
              res.redirect("/auth/login");
            }
          }
        );
      });
    });
  }
};

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
};

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/auth/login");
};
