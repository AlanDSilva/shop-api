const itemsRouter = require("express").Router();
const Item = require("../models/item");
const User = require("../models/user");

itemsRouter.get("/", async (req, res) => {
  const items = await Item.find({}).populate("user", { items: 0 });
  res.json(items);
});

itemsRouter.post("/", async (req, res) => {
  const body = req.body;

  const user = await User.findById(body.userId);

  const item = new Item({
    title: body.title,
    description: body.description,
    location: {
      ...body.location,
    },
    images: body.images ? [...body.images] : null,
    deliveryType: body.deliveryType,
    date: new Date(),
    user: user._id,
  });
  const savedItem = await item.save();

  user.items = user.items.concat(savedItem._id);
  await user.save();

  res.json(savedItem);
});

itemsRouter.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).end();
  }
});

itemsRouter.delete("/:id", async (req, res) => {
  await Item.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = itemsRouter;
