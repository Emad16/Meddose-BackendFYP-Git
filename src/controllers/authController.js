const passport = require("passport");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";

//------------ User Model ------------//
const User = require("../models/User");
const mongoose = require("mongoose");

exports.all = async (req, res) => {
  await User.find({})
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.json(error);
    });
};

//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
  const data = JSON.parse(Object.keys(req.body)[0]);
  // return res.status(200).json({ error: false });
  try {
    const {
      name,
      email,
      password,
      password2,
      phone,
      address,
      userType,
      profile,
      description,
      speciality,
      disease,
    } = data;
    let errors = [];

    //------------ Checking required fields ------------//
    // console.log(name || email);
    if (
      name == "" ||
      email == "" ||
      password == "" ||
      password2 == "" ||
      phone == "" ||
      address == "" ||
      userType == "" ||
      // !profile ||
      description == ""
    ) {
      errors.push("Please enter all fields");
    }

    //------------ Checking password mismatch ------------//
    if (password != password2) {
      errors.push("Passwords do not match");
    }

    //------------ Checking password length ------------//
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (phone.length < 11) {
      errors.push("Phone number must be at least 11 digits");
    }

    if (errors.length > 0) {
      return res.status(404).json({
        message: errors[0],
        error: true,
      });
    } else {
      console.log("TEST", data);
      //------------ Validation passed ------------//
      User.findOne({ email: email }).then((user) => {
        if (user) {
          //------------ User already exists ------------//
          errors.push({ msg: "Email ID already registered" });
          return res.status(404).json({
            message: errors[0],
            error: true,
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
            password2,
            phone,
            address,
            userType,
            profile,
            description,
            speciality,
            disease,
          });

          bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  // return res.json({
                  //   message: "account registered successfully",
                  //   error: false,
                  // });
                })
                .catch((err) => console.log(err));
            });
          });

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
                <h2>Congratulations ${name}:)</h2>
                <p>You have signed up as a ${userType}</p>
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
            from: '"Maddose" <congrats@maddose.com>', // sender address
            to: email, // list of receivers
            subject: "Account Created Successfully: Maddose", // Subject line
            generateTextFromHTML: true,
            html: output, // html body
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(404).json({
                message:
                  "Something went wrong on our end. Please register again.",
                error: true,
              });
            } else {
              console.log("Mail sent : %s", info.response);

              return res.json({
                message: "account registered successfully",
                error: false,
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: error.message,
      error: true,
    });
  }
};

//------------ Activate Account Handle ------------//
exports.activateHandle = (req, res) => {
  const token = req.params.token;
  let errors = [];
  if (token) {
    jwt.verify(token, JWT_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(404).json({
          message: "Incorrect or expired link! Please register again.",
          error: true,
        });
      } else {
        const {
          name,
          email,
          password,
          phone,
          address,
          userType,
          license,
          profile,
          experience,
          description,
          firm,
          category,
        } = decodedToken;
        User.findOne({ email: email }).then((user) => {
          if (user) {
            //------------ User already exists ------------//
            return res.status(404).json({
              message: "Email ID already registered! Please log in.",
              error: true,
            });
          } else {
            console.log(category, "category");

            const newUser = new User({
              name,
              email,
              password,
              phone,
              address,
              userType,
              verified: true,
              approved: false,
              category,
              license,
              profile,
              experience,
              description,
              firm,
            });

            bcryptjs.genSalt(10, (err, salt) => {
              bcryptjs.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    return res.json({
                      message: "Account activated. You can now log in.",
                      error: false,
                    });
                  })
                  .catch((err) => console.log(err));
              });
            });
          }
        });
      }
    });
  } else {
    console.log("Account activation error!");
  }
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
    return res.json({
      error: true,
      message: errors[0].msg,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        //------------ User already exists ------------//
        errors.push({ msg: "User with Email ID does not exist!" });
        return res.json({
          error: true,
          message: errors[0].msg,
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
        const CLIENT_URL = `http://${req.headers.host}/api`;
        const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                `;

        User.updateOne({ resetLink: token }, (err, success) => {
          if (err) {
            errors.push({ msg: "Error resetting password!" });
            res.json({
              error: true,
              message: errors[0].msg,
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
              from: '"Maddose" <Reset@maddose.com>', // sender address
              to: email, // list of receivers
              subject: "Account Password Reset: Maddose ✔", // Subject line
              html: output, // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                res.json({
                  error: true,
                  message:
                    "Something went wrong on our end. Please try again later.",
                });
              } else {
                console.log("Mail sent : %s", info.response);
                res.json({
                  error: false,
                  message: `Password reset link sent to ${email}. Please follow the instructions.`,
                });
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
        res.json({
          error: true,
          message: "Incorrect or expired link! Please try again.",
        });
      } else {
        const { _id } = decodedToken;
        User.findById(_id, (err, user) => {
          if (err) {
            res.json({
              error: true,
              message: "User with email ID does not exist! Please try again.",
            });
          } else {
            res.redirect(`/api/auth/reset/${_id}`);
            // res
            //   .writeHead(301, {
            //     Location: `http://localhost:3000/reset/${_id}`,
            //   })
            //   .end();
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
    res.redirect(`/api/auth/reset/${id}`);
    return;
  }

  //------------ Checking password length ------------//
  else if (password.length < 8) {
    req.flash("error_msg", "Password must be at least 8 characters.");
    res.redirect(`/api/auth/reset/${id}`);
    return;
  }

  //------------ Checking password mismatch ------------//
  else if (password != password2) {
    req.flash("error_msg", "Passwords do not match.");
    res.redirect(`/api/auth/reset/${id}`);
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
              res.redirect(`/api/auth/reset/${id}`);
            } else {
              // res.json({
              //   error: false,
              //   message: "Password reset successfully!",
              // });
              req.flash("success_msg", "Password reset successfully!");
              res.redirect("/api");
            }
          }
        );
      });
    });
  }
};

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
  // passport.authenticate("local", {
  //   successRedirect: "/auth/loginSuccess",
  //   failureRedirect: "/auth/loginFail",
  //   failureFlash: true,
  // })(req, res, next);
  const data = JSON.parse(Object.keys(req.body)[0]);
  // const data = req.body;
  console.log("TEST", data);
  User.findOne({
    email: data.email,
  }).then((user) => {
    if (!user) {
      return res.json({
        message: "This email ID is not registered",
        error: true,
        data: null,
      });
    }

    bcryptjs.compare(data.password, user.password, async (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        if (user?.careTaker) {
          const findCareTaker = await User.findOne({
            _id: user?.careTaker,
          });
          var finalUser = { ...user?._doc, caretaker_details: findCareTaker };
          return res.json({
            message: "Login Success",
            error: false,
            data: finalUser,
          });
        } else {
          return res.json({
            message: "Login Success",
            error: false,
            data: user,
          });
        }
      } else {
        return res.json({
          message: "Password incorrect! Please try again.",
          error: true,
          data: null,
        });
      }
    });
  });
  // passport.authenticate("local", (err, user, info) => {
  //   if (err) {
  //     // Handle error
  //     return res.status(200).json({ error: true, message: err.message });
  //   }

  //   if (!user) {
  //     // Authentication failed
  //     return res
  //       .status(200)
  //       .json({ error: true, message: "Authentication failed" });
  //   }

  //   // Authentication succeeded
  //   return res
  //     .status(200)
  //     .json({ message: "Authentication successful", user: user, error: false });
  // })(req, res, next);
};

exports.adminLoginHandle = (req, res, next) => {
  // passport.authenticate("local", {
  //   successRedirect: "/auth/loginSuccess",
  //   failureRedirect: "/auth/loginFail",
  //   failureFlash: true,
  // })(req, res, next);
  // const data = JSON.parse(Object.keys(req.body)[0]);
  const data = req.body;
  console.log("TEST", data);
  User.findOne({
    email: data.email,
  }).then((user) => {
    if (!user) {
      return res.json({
        message: "This email ID is not registered",
        error: true,
        data: null,
      });
    }

    bcryptjs.compare(data.password, user.password, async (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        if (user?.careTaker) {
          const findCareTaker = await User.findOne({
            _id: user?.careTaker,
          });
          var finalUser = { ...user?._doc, caretaker_details: findCareTaker };
          return res.json({
            message: "Login Success",
            error: false,
            data: finalUser,
          });
        } else {
          return res.json({
            message: "Login Success",
            error: false,
            data: user,
          });
        }
      } else {
        return res.json({
          message: "Password incorrect! Please try again.",
          error: true,
          data: null,
        });
      }
    });
  });
};
//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
  req.logout();
  res.json({ error: false, message: "You are logged out" });
};
