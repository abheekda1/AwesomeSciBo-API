const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const CONNECTION_URL = `mongodb://${MONGO_URI}`;

module.exports.connect = () => {
    mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}, (error, client) => {
        if (error) throw error;
    });
}