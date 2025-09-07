const router = require('express').Router();
const formatResponse = require('../utils/formatResponse');
const itemRouter = require('./item.routes');

router.use('/items', itemRouter);

// 404 handler middleware
router.use((req, res) => {
    res.status(404).json(formatResponse(false, 'Resource not found'));
});

module.exports = router;