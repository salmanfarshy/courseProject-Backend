import mongoose from "mongoose";
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tags: [String],
  author: {
    type: String,
    required: true,
  },
  synopsis: {
    type: String,
    required: true,
  },
  year: {
    type: Date,
    required: true,
  },
  comments: [{ user: String, date: String, comment: String }],
  likes: [String],
  collection: {
    type: Schema.Types.ObjectId,
    ref: "Collection",
    required: true,
  },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Item = mongoose.model("Item", itemSchema);
