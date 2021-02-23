const Item = require("../models/item");
const User = require("../models/user");

const initialItems = [
  {
    title: "Socks",
    description: "A pair of new socks",
    category: "Clothes",
    location: "Helsinki",
    images: ["firstImageUrl", "SecondImageUrl"],
    date: new Date(),
    price: 99.99,
    deliveryType: "Pickup",
  },
  {
    title: "Gloves",
    description: "A pair of new gloves",
    category: "Clothes",
    location: "Oulu",
    images: ["firstImageUrl", "SecondImageUrl"],
    price: 66.99,
    date: new Date(),
    deliveryType: "Shipping",
  },
];

const nonExistingId = async () => {
  const item = new Item({
    title: "Will be deleted",
    description: "Deleted to get valid but non existing id",
    categort: "Non",
    location: "Jyvaskyla",
    images: ["Not a real image1", "Not a real image2"],
    date: new Date(),
    price: 33.99,
    deliveryType: "Air ship",
  });
  await item.save();
  await item.remove();

  return item._id.toString();
};

const itemsInDb = async () => {
  const items = await Item.find({});
  return items.map((item) => item.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialItems,
  nonExistingId,
  itemsInDb,
  usersInDb,
};
