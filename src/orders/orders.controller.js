const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const middleware = require("./orders.middleware");
const nextId = require("../utils/nextId");

// ============= GET(s) ====================
function list(req, res) {
  res.json({ data: orders });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

// =========== POST =========================
function create(req, res) {
  const {
    locals: { reqBody },
  } = res;
  const newOrder = {
    ...reqBody,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// =============== PUT ======================
function update(req, res) {
  const {
    locals: { reqBody, order },
  } = res;
  Object.getOwnPropertyNames(order).forEach((prop) => {
    if (prop !== 'id' && order[prop] !== reqBody[prop]) {
      order[prop] = reqBody[prop];
    }
  });
  res.json({ data: order });
}

// ============= DELETE ===========
function destroy(req, res) {
  const { locals: { orderId } } = res;
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  orders.splice(orderIndex, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [
    middleware.bodyValidator,
    middleware.validateDishes,
    middleware.validateDishQuantity,
    create,
  ],
  read: [middleware.orderExists, read],
  update: [
    middleware.orderExists,
    middleware.bodyValidator,
    middleware.validateDishes,
    middleware.validateDishQuantity,
    middleware.bodyIdMatchesRouteId,
    middleware.bodyHasStatusProperty,
    update,
  ],
  delete: [middleware.orderExists, middleware.orderStatusIsPending, destroy],
  list,
};
