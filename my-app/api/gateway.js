const { proxy } = require('../server/gateway.cjs');
module.exports = (req, res) => proxy(req, res);
