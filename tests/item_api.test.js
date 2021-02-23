const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Item = require("../models/item");
const User = require("../models/user");

beforeEach(async () => {
  await Item.deleteMany({});
  await User.deleteMany({});

  const itemObjects = helper.initialItems.map((item) => new Item(item));
  const promiseArray = itemObjects.map((item) => item.save());
  await Promise.all(promiseArray);
});

describe("when there is initially some items saved", () => {
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
});

describe("addition of a new item", () => {
  const newItem = {
    title: "Snow Boots",
    description: "A pair of old snow boots",
    category: "Shoes",
    location: "Kokkola",
    images: ["firstImageUrl", "SecondImageUrl"],
    deliveryType: "Pickup",
    price: 139.99,
  };
  describe("if user not logged in...", () => {
    test("a valid item cannot be added", async () => {
      await api
        .post("/api/items")
        .send(newItem)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/items");

      expect(response.body).toHaveLength(helper.initialItems.length);
    });
  });
  describe("if user logged in...", () => {
    const newUser = {
      username: "UserWithItems",
      name: "UserWithItems",
      password: "UserWithItems",
    };

    test("a valid item can be added", async () => {
      const createdUser = await api
        .post("/api/users")
        .send(newUser)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      await api
        .post("/api/items")
        .send(newItem)
        .set({ Authorization: `Bearer ${createdUser.body.token}` })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/items");

      expect(response.body).toHaveLength(helper.initialItems.length + 1);
    });

    test("item without title is not added", async () => {
      const createdUser = await api
        .post("/api/users")
        .send(newUser)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const newItem = {
        description: "Old cardigan found behind my piano",
        category: "Clothes",
        location: "Tornio",
        images: [],
        deliveryType: "Shipping",
        price: 59.99,
      };

      await api
        .post("/api/items")
        .send(newItem)
        .set({ Authorization: `Bearer ${createdUser.body.token}` })
        .expect(400);

      const response = await api.get("/api/items");

      expect(response.body).toHaveLength(helper.initialItems.length);
    });
  });
});

describe("viewing a specific item", () => {
  test("an item with valid id can be viewed", async () => {
    const itemsAtStart = await helper.itemsInDb();

    const itemToView = itemsAtStart[0];

    const resultItem = await api
      .get(`/api/items/${itemToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedItemToView = JSON.parse(JSON.stringify(itemToView));

    expect(resultItem.body).toEqual(processedItemToView);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
