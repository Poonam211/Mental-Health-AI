import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv("data/Global_Mental_Health_Dataset_2025.csv")

# -------------------------------
# Handle Missing Values
# -------------------------------
df["Physical_Activity"] = df["Physical_Activity"].fillna("Moderate")
df["Treatment"] = df["Treatment"].fillna("None")

# -------------------------------
# Convert Categories to Scores
# -------------------------------

stress_map = {
    "Low": 25,
    "Medium": 50,
    "High": 75,
    "Severe": 100
}

physical_activity_map = {
    "Low": 100,
    "Moderate": 50,
    "High": 0
}

mental_history_map = {
    "No": 0,
    "Yes": 100
}

chronic_illness_map = {
    "No": 0,
    "Yes": 100
}

# Apply mappings
df["Stress_Score"] = df["Stress_Level"].map(stress_map)
df["Physical_Risk"] = df["Physical_Activity"].map(physical_activity_map)
df["Mental_History_Score"] = df["Mental_Health_History"].map(mental_history_map)
df["Chronic_Illness_Score"] = df["Chronic_Illness"].map(chronic_illness_map)

# -------------------------------
# Normalize Clinical Scores
# -------------------------------

# Depression Score is out of 27
df["Depression_Normalized"] = (
    df["Depression_Score"] / 27
) * 100

# Anxiety Score is out of 21
df["Anxiety_Normalized"] = (
    df["Anxiety_Score"] / 21
) * 100

# Sleep Risk
df["Sleep_Risk"] = ((10 - df["Sleep_Hours"]) / 10) * 100

# -------------------------------
# Final Mental Health Risk Score
# -------------------------------

df["Risk_Score"] = (
    0.35 * df["Depression_Normalized"] +
    0.30 * df["Anxiety_Normalized"] +
    0.20 * df["Stress_Score"] +
    0.10 * df["Sleep_Risk"] +
    0.05 * df["Mental_History_Score"]
)

# Keep score between 0 and 100
df["Risk_Score"] = df["Risk_Score"].clip(0, 100)

# -------------------------------
# Risk Level
# -------------------------------

def risk_level(score):

    if score < 30:
        return "Low"

    elif score < 50:
        return "Medium"

    elif score < 70:
        return "High"

    else:
        return "Critical"

df["Risk_Level"] = df["Risk_Score"].apply(risk_level)

# -------------------------------
# Mental State
# -------------------------------

def mental_state(row):

    if row["Depression_Normalized"] >= 70:
        return "Depression"

    elif row["Anxiety_Normalized"] >= 70:
        return "Anxiety"

    elif row["Stress_Score"] >= 70:
        return "Stress"

    else:
        return "Healthy"

df["Mental_State"] = df.apply(mental_state, axis=1)

# -------------------------------
# Save Clean Dataset
# -------------------------------

df.to_csv(
    "data/cleaned_mental_health.csv",
    index=False
)

print("Dataset Created Successfully!")

print("\nRisk Score Statistics:")
print(df["Risk_Score"].describe())

print("\nRisk Level Distribution:")
print(df["Risk_Level"].value_counts())

print("\nMental State Distribution:")
print(df["Mental_State"].value_counts())