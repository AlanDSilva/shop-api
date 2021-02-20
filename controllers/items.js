const itemsRouter = require("express").Router();
const Item = require("../models/item");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const middleware = require("../utils/middleware");
const _ = require("lodash");

itemsRouter.get("/", async (req, res) => {
  const category = req.query.category;
  const country = req.query.country;
  const city = req.query.city;
  const maxPrice = req.query.maxPrice;
  const minPrice = req.query.minPrice;

  const oPrice = req.query.oPrice; // Must be 'asc' or 'desc'
  const oDate = req.query.oDate; // Must be 'asc' or 'desc'

  let items = await Item.find({}).populate("user", { items: 0 });

  if (category) items = _.filter(items, ["category", category]);
  if (country) items = _.filter(items, (o) => o.location.country === country);
  if (city) items = _.filter(items, (o) => o.location.city === city);
  if (maxPrice) items = _.filter(items, (o) => o.price <= maxPrice);
  if (minPrice) items = _.filter(items, (o) => o.price >= minPrice);

  if (oPrice) items = _.orderBy(items, ["price"], [oPrice]);
  if (oDate) items = _.orderBy(items, ["date"], [oDate]);

  res.json(items);
});

// itemsRouter.post(
//   "/",
//   middleware.parser.array("image", 4),
//   middleware.getToken,
//   async (req, res) => {
//     const body = req.body;

//     const decodedToken = jwt.verify(req.token, process.env.SECRET);
//     if (!req.token || !decodedToken.id) {
//       return res.status(401).json({ error: "token missing or invalid" });
//     }

//     const user = await User.findById(decodedToken.id);

//     const item = new Item({
//       title: body.title,
//       description: body.description,
//       category: body.category,
//       location: {
//         ...body.location,
//       },
//       images: _.map(req.files, "path"),
//       deliveryType: body.deliveryType,
//       price: body.price,
//       date: new Date(),
//       user: user._id,
//     });
//     const savedItem = await item.save();

//     user.items = user.items.concat(savedItem._id);
//     await user.save();

//     res.json(savedItem);
//   }
// );

itemsRouter.post("/", middleware.getToken, async (req, res) => {
  const body = req.body;

  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  const item = new Item({
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    image: body.image,
    deliveryType: body.deliveryType,
    price: body.price,
    date: new Date(),
    user: user._id,
  });
  const savedItem = await item.save();

  user.items = user.items.concat(savedItem._id);
  await user.save();

  res.json({ item });
});

itemsRouter.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).end();
  }
});

itemsRouter.delete("/:id", middleware.getToken, async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const item = await Item.findById(req.params.id);

  if (item.user.toString() === decodedToken.id) {
    await Item.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } else {
    res.status(401).json({ error: "user not allowed to delete this item" });
  }
});

module.exports = itemsRouter;
