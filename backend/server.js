import "dotenv/config";
import express from "express";
import  connectDB  from "./config/db.js";

import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);

// Register your other routers here.

app.use(notFound);
app.use(errorHandler);

await connectDB();



app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});