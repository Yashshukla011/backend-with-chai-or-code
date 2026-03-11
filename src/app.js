import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";

const app = express();

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(cookieParser());

app.use(express.static("public"));


app.use("/api/v1/users", userRoute);

export { app };