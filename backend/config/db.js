const mongoose = require("mongoose");

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in your .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};
