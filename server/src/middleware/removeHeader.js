const removeHTTPHeader = (req, res, next) => {
    res.removeHeader('x-powered-by');
    next();
};

module.exports = removeHTTPHeader;