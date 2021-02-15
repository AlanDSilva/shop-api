const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Item = require("../models/item");

beforeEach(async () => {
  await Item.deleteMany({});

  const itemObjects = helper.initialItems.map((item) => new Item(item));
  const promiseArray = itemObjects.map((item) => item.save());
  await Promise.all(promiseArray);
});

test("items are returned as json", async () => {
  await api
    .get("/api/items")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all items are returned", async () => {
  const response = await api.get("/api/items");

  expect(response.body).toHaveLength(helper.initialItems.length);
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

test("a specific item can be viewed", async () => {
  const itemsAtStart = await helper.itemsInDb();

  const itemToView = itemsAtStart[0];

  const resultItem = await api
    .get(`/api/items/${itemToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const processedItemToView = JSON.parse(JSON.stringify(itemToView));

  expect(resultItem.body).toEqual(processedItemToView);
});

test("an item can be deleted", async () => {
  const itemsAtStart = await helper.itemsInDb();
  const itemToDelete = itemsAtStart[0];

  await api.delete(`/api/items/${itemToDelete.id}`).expect(204);

  const itemsAtEnd = await helper.itemsInDb();

  expect(itemsAtEnd).toHaveLength(helper.initialItems.length - 1);

  const titles = itemsAtEnd.map((r) => r.title);

  expect(titles).not.toContain(itemToDelete.title);
});

afterAll(() => {
  mongoose.connection.close();
});
