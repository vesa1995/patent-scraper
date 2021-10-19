const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    url: process.env.API_URL,
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL
};