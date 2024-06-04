import express from "express";
import cors from "cors";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import {
  register,
  login,
  createCollection,
  getAllCollections,
  getCollections,
  getCollection,
  editCollection,
  deleteCollection,
  createItem,
  getItems,
  deleteItem,
  getItem,
  editItem,
  getEditItem,
  updateLike,
  createComment,
  latestItems,
  largestCollections,
} from "./controllers/all.controller.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://course-project-client-app.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db.js
mongoose
  .connect(process.env.Mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

cloudinary.v2.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Collection_photo",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

app.post("/register", register);
app.post("/login", login);
app.post("/collection/new", upload.single("image"), createCollection);
app.get("/collections", getCollections);
app.post("/all-collections", getAllCollections);
app.get("/collection/edit/:id", getCollection);
app.patch("/collection/edit", upload.single("image"), editCollection);
app.delete("/collection/delete", deleteCollection);
app.post("/item/new", createItem);
app.post("/items", getItems);
app.get("/item/:id", getItem);
app.delete("/item/delete", deleteItem);
app.get("/item/edit/:id", getEditItem);
app.patch("/item/edit", editItem);
app.post("/like", updateLike);
app.post("/newComment", createComment);
app.get("/latestitems", latestItems);
app.get("/LargestCollections", largestCollections);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is running!");
});
