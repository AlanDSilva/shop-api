const itemsRouter = require("express").Router();
const Item = require("../models/item");

itemsRouter.get("/", async (req, res) => {
  const items = await Item.find({});
  res.json(items);
});

itemsRouter.post("/", async (req, res, next) => {
  const body = req.body;

  const item = new Item({
    title: body.title,
    description: body.description,
    location: {
      ...body.location,
    },
    images: body.images ? [...body.images] : null,
    deliveryType: body.deliveryType,
    date: new Date(),
  });

  const savedItem = await item.save();
  res.json(savedItem);
});

module.exports = itemsRouter;
