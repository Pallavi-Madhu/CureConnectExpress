import os
import pandas as pd
from supabase import create_client, Client

# --- Load environment variables ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API")

# --- Initialize Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Load dataset ---
# Replace with your actual path to the Kaggle CSV file
df = pd.read_csv("/home/kirubha/Downloads/CTD_chemicals_diseases.csv", low_memory=False)

# --- Select only relevant columns ---
columns_needed = ["DiseaseName", "DiseaseID", "InferenceGeneSymbol", "InferenceScore"]
df = df[columns_needed].dropna(subset=["DiseaseName", "DiseaseID", "InferenceScore"]).head(50)

# --- Prepare data as list of dicts for Supabase ---
records = df.to_dict(orient="records")

# --- Insert into Supabase table ---
try:
    response = supabase.table("Disease").insert(records).execute()
    print("✅ Successfully inserted records into Disease table.")
    print(f"Inserted: {len(records)} rows")
except Exception as e:
    print("❌ Error inserting data:", e)
