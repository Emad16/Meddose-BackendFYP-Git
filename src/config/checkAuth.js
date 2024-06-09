//------------ Routing via Auth ------------//
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    // req.flash('error_msg', 'Please log in first!');
    res.json({ message: "Please log in first!", error: true });
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    // res.redirect('/dashboard');
  },
};
