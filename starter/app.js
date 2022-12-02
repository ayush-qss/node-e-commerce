require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

const morgan = require("morgan");

const connectDb = require("./db/connect");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const notFoundMiddleWare = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("E-commerce API");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

app.use(notFoundMiddleWare);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    connectDb(process.env.MONGO_URL);
    console.log("Connected to DB");
    app.listen(port, console.log("Server is started at port ", port));
  } catch (err) {
    console.log(err);
  }
};

start();
