const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js DNS resolver to use Google Public DNS for SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async() => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in environment variables.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;