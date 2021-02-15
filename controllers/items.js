const itemsRouter = require("express").Router();
const Item = require("../models/item");

itemsRouter.get("/", (req, res) => {
  Item.find({}).then((items) => {
    res.json(items.map((item) => item.toJSON()));
  });
});

module.exports = itemsRouter;
