const codeforces = require('./cf.js');
module.exports = { async crawl(id) { return codeforces.crawl('contest', id); } }