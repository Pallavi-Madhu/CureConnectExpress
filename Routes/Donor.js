import express from "express";
import { supabase } from "../supabaseClient.js";

const donorRouter = express.Router();

donorRouter.post("/", async (req, res) => {
  const donorData = req.body;
  console.log("Received donor data:", donorData);

  try {
    const { data, error } = await supabase
      .from("Donor") 
      .insert([donorData]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(201)
      .json({ message: "Donor registered successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export { donorRouter };
