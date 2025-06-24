import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    itemImage: { type: String },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    startTime: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["active", "ended", "upcoming"],
      default: "upcoming",
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winningBid: { type: Number },
  },
  { timestamps: true }
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
 