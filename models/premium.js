const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ✅ Support both user & employer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      default: null,
    },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    plan: {
      type: String,
      enum: ["basic", "pro", "gold"],
      required: true,
    },
    duration: {
      type: String,
      enum: ["month", "year"],
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

// ✅ Helper: Identify who made the payment
paymentSchema.methods.getPayer = function () {
  return this.user ? "User" : "Employer";
};

module.exports = mongoose.model("Payment", paymentSchema);
