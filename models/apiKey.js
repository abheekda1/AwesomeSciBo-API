const mongoose = require('mongoose');

const APIKeySchema = new mongoose.Schema({
    'Email': String,
    'API Key': String,
    'Valid': Boolean
});
  
module.exports = mongoose.model('APIKeys', APIKeySchema);