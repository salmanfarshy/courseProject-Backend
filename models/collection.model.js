import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  img: {
    path: String,
    filename: String,
  },
  description: {
    type: String,
    required: true,
  },
  items: [String],
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Collection = mongoose.model("Collection", collectionSchema);
