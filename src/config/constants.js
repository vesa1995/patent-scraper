const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    url: process.env.URL,
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    backendUrl: process.env.BACKEND_URL,
    backendPort: process.env.BACKEND_PORT,
    backendEndpoint: process.env.BACKEND_ENDPOINT
};