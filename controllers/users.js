const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/:username", async (request, response) => {
  const users = await User.findOne({
    username: request.params.username,
  }).populate("items", { user: 0 });
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const body = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  const userForToken = {
    username: savedUser.username,
    name: savedUser.name,
    id: savedUser.id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  response.json({ token, username: savedUser.username, name: savedUser.name });
});

module.exports = usersRouter;
