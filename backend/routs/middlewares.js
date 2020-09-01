// Middleware to prevent users who are not logged in
exports.loggedIn = (req, res, next) => {
    if (!req.user) return res.status(401).end();
    return next();
}