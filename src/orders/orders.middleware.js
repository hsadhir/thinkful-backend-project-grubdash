const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));

const validateDeliverTo = (deliverTo) =>
  deliverTo ? null : "Order must include a deliverTo property.";

const validateMobileNumber = (mobileNumber) =>
  mobileNumber ? null : "Order must include a mobileNumber property.";

const bodyValidator = (req, res, next) => {
  const { data = {} } = req.body;

  const deliverToError = validateDeliverTo(data.deliverTo);
  const mobileNumberError = validateMobileNumber(data.mobileNumber);

  const errorMessage = deliverToError || mobileNumberError;

  if (errorMessage) {
    next({
      status: 400,
      message: errorMessage,
    });
  } else {
    res.locals.reqBody = data;
    return next();
  }
};

const validateDishes = (req, res, next) => {
  const {
    locals: { reqBody },
  } = res;

  if (
    !reqBody.dishes ||
    !reqBody.dishes.length ||
    !Array.isArray(reqBody.dishes)
  ) {
    next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  }

  return next();
};

const validateDishQuantity = (req, res, next) => {
  const {
    reqBody: { dishes },
  } = res.locals;

  const invalidDishIndex = dishes.findIndex(
    (dish) =>
      !dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== "number"
  );

  if (invalidDishIndex === -1) {
    return next();
  }

  const dishIdx = Array.isArray(invalidDishIndex)
    ? invalidDishIndex.join(", ")
    : invalidDishIndex;

  next({
    status: 400,
    message: `Dish${
      Array.isArray(invalidDishIndex) ? "es" : ""
    } ${dishIdx} must have a quantity that is an integer greater than 0.`,
  });
};

const orderExists = (req, res, next) => {
  const {
    params: { orderId },
  } = req;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    res.locals.orderId = orderId;
    return next();
  }

  next({
    status: 404,
    message: `No matching order is found for orderId ${orderId}.`,
  });
}

const bodyIdMatchesRouteId = (req, res, next) => {
  const {
    locals: {
      orderId,
      reqBody: { id },
    },
  } = res;
  if (id) {
    if (id === orderId) {
      return next();
    }
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  return next();
};

const bodyHasStatusProperty = (req, res, next) => {
  const {
    locals: { reqBody },
  } = res;

  if (!reqBody.status || reqBody.status === "invalid") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
    });
  }

  if (reqBody.status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }

  return next();
};

const orderStatusIsPending = (req, res, next) => {
  const {
    locals: { order },
  } = res;

  if (order.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  return next();
};

module.exports = {
  orderStatusIsPending,
  bodyHasStatusProperty,
  bodyIdMatchesRouteId,
  orderExists,
  bodyValidator,
  validateDishes,
  validateDishQuantity,
};
