const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

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

beforeEach(async () => {
  await Item.deleteMany({});
  let itemObject = new Item(initialItems[0]);
  await itemObject.save();
  itemObject = new Item(initialItems[1]);
  await itemObject.save();
});

const api = supertest(app);

test("items are returned as json", async () => {
  await api
    .get("/api/items")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all items are returned", async () => {
  const response = await api.get("/api/items");

  expect(response.body).toHaveLength(initialItems.length);
});

test("a specific item is within the returned items", async () => {
  const response = await api.get("/api/items");

  const titles = response.body.map((r) => r.title);
  expect(titles).toContain("Gloves");
});

afterAll(() => {
  mongoose.connection.close();
});
