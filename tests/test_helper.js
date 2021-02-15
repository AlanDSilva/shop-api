const Item = require("../models/item");

const initialItems = [
  {
    title: "Socks",
    description: "A pair of new socks",
    location: {
      country: "Finland",
      city: "Helsinki",
    },
    images: ["firstImageUrl", "SecondImageUrl"],

    date: new Date(),
    deliveryType: "Pickup",
  },
  {
    title: "Gloves",
    description: "A pair of new gloves",
    location: {
      country: "Finland",
      city: "Oulu",
    },
    images: ["firstImageUrl", "SecondImageUrl"],

    date: new Date(),
    deliveryType: "Shipping",
  },
];

const nonExistingId = async () => {
  const item = new Item({
    title: "Will be deleted",
    description: "Deleted to get valid but non existing id",
    location: {
      country: "Fake Country",
      city: "Fake city",
    },
    images: ["Not a real image1", "Not a real image2"],
    date: new Date(),
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

module.exports = {
  initialItems,
  nonExistingId,
  itemsInDb,
};
