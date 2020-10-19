// this Module is the path helper function for Navigation
// instead of use     response.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
// especially to ise __dirname, '..', in admin.js module

const path = require('path');

module.exports = path.dirname(require.main.filename);


