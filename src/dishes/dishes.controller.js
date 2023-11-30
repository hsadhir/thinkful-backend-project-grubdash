const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const {
  bodyValidator,
  dishExists,
  bodyIdMatchesRouteId,
} = require("./dishes.middleware");
const nextId = require("../utils/nextId");

const update = (req, res) => {
  const { dish, reqBody } = res.locals;
  Object.getOwnPropertyNames(dish).forEach((prop) => {
    if (dish[prop] !== reqBody[prop]) {
      dish[prop] = reqBody[prop];
    }
  });
  res.json({ data: dish });
};

const create = (req, res) => {
  const { reqBody } = res.locals;
  const newDish = {
    ...reqBody,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const read = (req, res) => {
  res.json({ data: res.locals.dish });
};

const list = (req, res) => {
  res.json({ data: dishes });
};

module.exports = {
  create: [bodyValidator, create],
  read: [dishExists, read],
  update: [dishExists, bodyValidator, bodyIdMatchesRouteId, update],
  list,
};
