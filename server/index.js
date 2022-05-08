// lib
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
// custom
import userRoutes from "./src/routes/user.js";
import adminRoutes from "./src/routes/admin.js";
import hotelRoutes from "./src/routes/hotel.js";
import cityRoutes from "./src/routes/city.js";
import roomRoutes from "./src/routes/room.js";
import roomTypeRoutes from "./src/routes/room_type.js";
import roomServiceRoutes from "./src/routes/room_service.js";

// pre-config
dotenv.config();
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true, //access-control-allow-credentials:true
};
// express
const app = express();
// middleware
app.use(express.json({ limit: "100mb" }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("static"));
// routes
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/city", cityRoutes);
app.use("/hotel", hotelRoutes);
app.use("/room", roomRoutes);
app.use("/room_type", roomTypeRoutes);
app.use("/room_service", roomServiceRoutes);

//Connect to DB
const PORT = process.env.PORT;
const CONNECTION_URL = "mongodb://127.0.0.1:27017/qq";

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(error.message));
