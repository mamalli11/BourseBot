const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Payment = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    payment: { type: Boolean, default: false },
    resnumber: { type: String, required: true },
    price: { type: String, required: true },
    product: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", Payment);
