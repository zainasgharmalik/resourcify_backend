import mongoose from "mongoose";

const schema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabResource",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  purpose: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

export const LendLabResource = mongoose.model("LendLabResource", schema);
