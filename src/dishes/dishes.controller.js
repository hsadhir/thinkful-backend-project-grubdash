const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const {
  bodyValidator,
  dishExists,
  bodyIdMatchesRouteId,
} = require("./dishes.middleware");
const nextId = require("../utils/nextId");

function update(req, res) {
  const { dish, reqBody } = res.locals;
  Object.getOwnPropertyNames(dish).forEach(function (prop) {
    if (dish[prop] !== reqBody[prop]) {
      dish[prop] = reqBody[prop];
    }
  });
  res.json({ data: dish });
}

function create(req, res) {
  const { reqBody } = res.locals;
  const newDish = {
    ...reqBody,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [bodyValidator, create],
  read: [dishExists, read],
  update: [dishExists, bodyValidator, bodyIdMatchesRouteId, update],
  list,
};
