function isAuthenticated(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  } else {
    res.redirect("/auth");
  }
}

module.exports = { isAuthenticated };
