// Result.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const resultRouter = express.Router();

//  GET /api/results/:id → Detect disease risk for patient
resultRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("📥 Received Patient_id:", id);

  try {
    //  Fetch patient info
    const { data: patient, error: patientError } = await supabase
      .from("Patient")
      .select("Patient_id, Name, InferenceGeneSymbol")
      .eq("Patient_id", id)
      .single();

    if (patientError || !patient) {
      console.log("❌ Patient fetch error:", patientError);
      return res.status(404).json({ error: "Patient not found" });
    }

    console.log("✅ Patient found:", patient);

    // Fetch diseases linked to the same InferenceGeneSymbol
    const { data: diseases, error: diseaseError } = await supabase
      .from("Disease")
      .select("id, DiseaseID, DiseaseName, InferenceGeneSymbol")
      .eq("InferenceGeneSymbol", patient.InferenceGeneSymbol);

    if (diseaseError) throw diseaseError;

    if (!diseases || diseases.length === 0) {
      console.log(" No diseases found for gene:", patient.InferenceGeneSymbol);
      return res.json({
        patient,
        results: [
          {
            DiseaseID: null,
            DiseaseName: "No disease risk",
            InferenceGeneSymbol: null,
          },
        ],
      });
    }

    console.log(
      ` Found ${diseases.length} disease(s) for gene ${patient.InferenceGeneSymbol}`
    );

    // 🧩 3️⃣ For each disease, check before inserting (avoid duplicates)
    for (const d of diseases) {
      try {
        // Check if already exists
        const { data: existing, error: checkError } = await supabase
          .from("Patient-Disease")
          .select("id")
          .eq("Patient_id", patient.Patient_id)
          .eq("DiseaseID", d.DiseaseID)
          .maybeSingle();

        if (checkError) {
          console.log("Error checking existing record:", checkError.message);
          continue;
        }

        if (!existing) {
          // Insert only if not already present
          const { error: insertError } = await supabase
            .from("Patient-Disease")
            .insert({
              Patient_id: patient.Patient_id,
              Did: d.id,
              DiseaseID: d.DiseaseID,
              DiseaseName: d.DiseaseName,
            });

          if (insertError) {
            console.log(
              ` Error inserting ${d.DiseaseName}:`,
              insertError.message
            );
          } else {
            console.log(
              ` Inserted ${d.DiseaseName} for patient ${patient.Patient_id}`
            );
          }
        } else {
          console.log(
            ` Skipped duplicate: ${d.DiseaseName} for patient ${patient.Patient_id}`
          );
        }
      } catch (innerErr) {
        console.error("❌ Inner loop error:", innerErr.message);
      }
    }

    //  Return response
    res.json({
      patient,
      results: diseases,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

//  GET /api/results/patient/:id → Fetch all stored diseases for a patient
resultRouter.get("/patient/:id", async (req, res) => {
  const { id } = req.params;
  console.log(" Fetching stored diseases for patient:", id);

  try {
    const { data: diseases, error } = await supabase
      .from("Patient-Disease")
      .select("DiseaseID, DiseaseName")
      .eq("Patient_id", id);

    if (error) throw error;

    if (!diseases || diseases.length === 0) {
      return res.json({ diseases: [] });
    }

    res.json({ diseases });
  } catch (err) {
    console.error("❌ Error fetching Patient-Disease:", err);
    res.status(500).json({
      error: "Failed to fetch patient diseases",
      details: err.message,
    });
  }
});

export { resultRouter };
