const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

const validateName = (name) => (name ? null : "Dish must include a name.");
const validateDescription = (description) =>
  description ? null : "Dish must include a description.";
const validateImageUrl = (imageUrl) =>
  imageUrl ? null : "Dish must include an image_url.";
const validatePrice = (price) => {
  if (price === undefined) {
    return "Dish must include a price.";
  }
  if (!(price > 0 && typeof price === "number")) {
    return "Dish must include a price, and it must be an integer greater than 0.";
  }
  return null;
};

const bodyValidator = (req, res, next) => {
  const { data = {} } = req.body;

  const nameError = validateName(data.name);
  const descriptionError = validateDescription(data.description);
  const imageUrlError = validateImageUrl(data.image_url);
  const priceError = validatePrice(data.price);

  const errorMessage =
    nameError || descriptionError || imageUrlError || priceError;

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

// Validation Function for Read and Update functions:
const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
};

// Validation Function for the Update function:
const bodyIdMatchesRouteId = (req, res, next) => {
  const {
    dishId,
    reqBody: { id },
  } = res.locals;

  if (id) {
    if (id === dishId) {
      return next();
    }
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
};

module.exports = {
  bodyValidator,
  bodyIdMatchesRouteId,
  dishExists,
};
