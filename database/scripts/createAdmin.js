require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const passwordHash = await bcrypt.hash("Gokulgk@12", 10);

    const admin = await User.create({
      name: "Admin",
      email: "gokulakrishnankathavarayan@gmail.com",
      passwordHash,
      role: "Admin",
    });

    console.log("✅ Admin created successfully:", admin);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

createAdmin();
