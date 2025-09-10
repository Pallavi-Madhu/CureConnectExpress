import express from "express";
import cors from "cors";
import { authRouter } from "./Routes/Auth.js";
import {donorRouter} from "./Routes/Donor.js";

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use("/api", router);
app.use("/api/auth", authRouter);
app.use("/api/donor", donorRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
