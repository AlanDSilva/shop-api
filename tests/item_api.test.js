const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

beforeEach(async () => {
  await Item.deleteMany({});
  let itemObject = new Item(helper.initialItems[0]);
  await itemObject.save();
  itemObject = new Item(helper.initialItems[1]);
  await itemObject.save();
});

test("items are returned as json", async () => {
  await api
    .get("/api/items")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all items are returned", async () => {
  const response = await api.get("/api/items");

  expect(response.body).toHaveLength(herlper.initialItems.length);
});

test("a specific item is within the returned items", async () => {
  const response = await api.get("/api/items");

  const titles = response.body.map((r) => r.title);
  expect(titles).toContain("Gloves");
});

test("a valid item can be added", async () => {
  const newItem = {
    title: "Snow Boots",
    description: "A pair of old snow boots",
    location: {
      country: "Finland",
      city: "Kokkola",
    },
    images: ["firstImageUrl", "SecondImageUrl"],
    deliveryType: "Pickup",
  };

  await api
    .post("/api/items")
    .send(newItem)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/items");

  const titles = response.body.map((r) => r.title);

  expect(response.body).toHaveLength(helper.initialItems.length + 1);
  expect(titles).toContain("Snow Boots");
});

test("item without title is not added", async () => {
  const newItem = {
    description: "Old cardigan found behind my piano",
    location: {
      country: "Finland",
      city: "Helsinki",
    },
    images: [],
    deliveryType: "Shipping",
  };

  await api.post("/api/items").send(newItem).expect(400);

  const response = await api.get("/api/items");

  expect(response.body).toHaveLength(helper.initialItems.length);
});

afterAll(() => {
  mongoose.connection.close();
});
