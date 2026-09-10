const path = require("path");

// Safely load .env from the root directory
require("dotenv").config()

const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB before accepting incoming HTTP requests
const startServer = async() => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();