import express from "express";
import { supabase } from "../supabaseClient.js";

const patientRouter = express.Router();

patientRouter.post("/", async (req, res) => {
  const patientData = req.body;
  console.log("Received patient data:", patientData);

  try {
    const { data, error } = await supabase
      .from("Patient") 
      .insert([patientData]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(201)
      .json({ message: "Patient registered successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export { patientRouter };
