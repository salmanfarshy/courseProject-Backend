import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Collection } from "../models/collection.model.js";
import { Item } from "../models/item.model.js";
import cloudinary from "cloudinary";

export const register = async (req, res) => {
  try {
    const { credentials } = req.body;
    console.log(credentials);

    // CREATE A NEW USER AND SAVE TO DB
    let newUser = await User.create(credentials);
    console.log(newUser);

    const token = jwt.sign(
      {
        userId: newUser._id,
        name: newUser.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7h" }
    );

    const { name, email, block, view, isAdmin, _id: userId } = newUser;
    newUser = { name, email, block, view, isAdmin, userId };

    return res.json({
      success: "success",
      newUser,
      token,
    });
  } catch (err) {
    return res.json({
      success: "unsuccess",
    });
  }
};

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email: userEmail, password } = req.body;

    // // CHECK IF THE USER EXISTS
    const user = await User.findOne({ email: userEmail });
    console.log(user);
    if (!user) return res.json("unsuccess");
    if (password !== user.password) return res.json("unsuccess");
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7h" }
    );
    console.log(user);

    const { name, email, block, view, isAdmin, _id: userId } = user;
    const newUser = { name, email, block, view, isAdmin, userId };
    console.log(user);

    return res.json({
      success: "success",
      newUser,
      token,
    });
  } catch (err) {
    return res.json("unsuccess");
  }
};

export const createCollection = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.file);

    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await Collection.create({
      ...req.body,
      img: { path: req.file?.path, filename: req.file?.filename },
    });

    if (newUser) return res.send("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const getCollections = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    let Collections = null;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) return res.json("unsuccess");
      // console.log(payload);
      // fetch all collections
      Collections = await Collection.find({
        owner: payload?.userId,
      }).populate("owner", ["name", "block", "view"]);

      return res.json(Collections);
    });
  } catch (err) {
    return res.send(false);
  }
};

export const getAllCollections = async (req, res) => {
  try {
    // console.log(req.body);
    const { name } = req.body;
    if (name === "all") {
      const Collections = await Collection.find().populate("owner", [
        "name",
        "block",
        "view",
      ]);

      return res.json(Collections);
    } else {
      const Collections = await Collection.find({ category: name }).populate(
        "owner",
        ["name", "block", "view"]
      );

      return res.json(Collections);
    }
  } catch (err) {
    return res.send(false);
  }
};

export const getCollection = async (req, res) => {
  try {
    // console.log(req.params);
    // fetch collection
    const collection = await Collection.findById(req.params.id);
    // console.log(collection);
    return res.json(collection);
  } catch (err) {
    return res.send(false);
  }
};

export const editCollection = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.file);

    let updateData = {};

    if (!req.file) {
      updateData = {
        name: req.body?.name,
        category: req.body?.category,
        description: req.body?.description,
      };
    } else {
      await cloudinary.uploader.destroy(req.body?.publicId);
      updateData = {
        name: req.body?.name,
        category: req.body?.category,
        description: req.body?.description,
        img: { path: req.file?.path, filename: req.file?.filename },
      };
    }

    const updateColl = await Collection.updateOne(
      { _id: req.body?.collId },
      { $set: updateData }
    );

    // console.log(updateColl);
    return res.json("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const deleteCollection = async (req, res) => {
  try {
    // console.log(req.body);

    await cloudinary.uploader.destroy(req.body?.imgId);

    const collection = await Collection.findByIdAndDelete(req.body?.deleteId);
    // console.log(collection);

    const items = await Item.deleteMany({
      _id: { $in: collection?.items },
    });
    // console.log(items);

    return res.json("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const createItem = async (req, res) => {
  try {
    // console.log(req.body);
    const tags = req.body.tags.split(" ");
    const items = await Item.find({}, "id");
    const id = items.length ? items.length + 1 : 1;
    const item = await Item.create({ ...req.body, id, tags });

    const itemId = item._id;
    const itemIdString = itemId.toString();

    const collectionId = item.collection;
    const collectionIdString = collectionId.toString();

    const collection = await Collection.findById({ _id: collectionIdString });

    collection.items.push(itemIdString);
    await collection.save();

    console.log(collection);
    console.log(item);
    return res.json("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const getItems = async (req, res) => {
  try {
    // console.log(req.body);
    if (req.body?.Id === "all") {
      const items = await Item.find();
      return res.json(items);
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const items = await Item.find({ collection: req.body?.Id });
      return res.json(items);
    }

    let items = null;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) return res.json("unsuccess");
      if (req.body?.Id === payload?.userId)
        items = await Item.find({ owner: payload?.userId });
      else items = await Item.find({ collection: req.body?.Id });
      // console.log(items);

      return res.json(items);
    });
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const latestItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).limit(5);

    return res.json(items);
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const largestCollections = async (req, res) => {
  try {
    const collections = await Collection.aggregate([
      {
        $addFields: {
          itemsCount: { $size: "$items" },
        },
      },
      {
        $sort: { itemsCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.json(collections);
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const getItem = async (req, res) => {
  try {
    // console.log(req.params);
    // fetch item
    const item = await Item.findById(req.params.id)
      .populate({
        path: "collection",
        select: "name",
      })
      .populate({
        path: "owner",
        select: "name",
      });
    return res.json(item);
  } catch (err) {
    return res.send(false);
  }
};

export const deleteItem = async (req, res) => {
  try {
    // console.log(req.body);

    const item = await Item.findByIdAndDelete(req.body?.deleteId);

    const itemId = item._id;
    const itemIdString = itemId.toString();

    const collectionId = item.collection;
    const collectionIdString = collectionId.toString();

    const collection = await Collection.findById({ _id: collectionIdString });
    const items = collection.items.filter((item) => item !== itemIdString);
    collection.items = items;
    await collection.save();

    console.log(item);
    return res.json("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const getEditItem = async (req, res) => {
  try {
    // console.log(req.params);
    // fetch item
    const item = await Item.findById(req.params.id);

    return res.json(item);
  } catch (err) {
    return res.send(false);
  }
};

export const editItem = async (req, res) => {
  try {
    // console.log(req.body);

    let tags = req.body.tags.split(" ");
    const updateItem = { ...req.body, tags };
    const item = await Item.updateOne(
      { _id: req.body?.itemId },
      { $set: updateItem }
    );

    console.log(item);
    return res.json("success");
  } catch (err) {
    return res.send("unsuccess");
  }
};

export const updateLike = async (req, res) => {
  try {
    // console.log(req.body);
    const { itemId, userId } = req.body;
    const item = await Item.findById({ _id: itemId });

    const like = item.likes.includes(userId);
    // console.log(item);
    if (!like) {
      item?.likes.push(userId);
      await item.save();
      return res.json(item.likes);
    } else {
      const likes = item.likes.filter((like) => like !== userId);
      item.likes = likes;
      await item.save();
      return res.json(item.likes);
    }
  } catch (err) {
    return res.send(false);
  }
};

export const createComment = async (req, res) => {
  try {
    // console.log(req.body);
    const { itemId, userName, date, comment } = req.body;
    const item = await Item.findById({ _id: itemId });

    item.comments.push({ user: userName, date: date, comment: comment });
    await item.save();
    console.log(item);

    return res.send(item.comments);
  } catch (err) {
    return res.send(false);
  }
};
