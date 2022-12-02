const CustomError = require("../errors");
const { isTokenValid } = require("../utils/index");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Invalid Authentication");
  }
  try {
    const { name, role, id } = isTokenValid({ token });
    req.user = { name, role, id };
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError("Invalid Authentication");
  }
};

const authorizePermissions = (req, res, next) => {
  const { role } = req.user;
  if (role === "admin") {
    next();
  } else {
    throw new CustomError.UnAuthorizedError(
      "unauthorized to access this route"
    );
  }
};

module.exports = { authenticateUser, authorizePermissions };
