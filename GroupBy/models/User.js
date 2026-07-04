const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    publicId: {
    type: String,
    default: () => crypto.randomUUID(), // Generates an unguessable 36-character string
    unique: true
  },

  
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
    },

    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
