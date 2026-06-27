import pandas as pd

# Load datasets
global_df = pd.read_csv("data/Global_Mental_Health_Dataset_2025.csv")
sleep_df = pd.read_csv("data/Sleep_health_and_lifestyle_dataset.csv")

print("Global Dataset Shape:", global_df.shape)
print("Sleep Dataset Shape:", sleep_df.shape)

# Select useful columns from Global Dataset
global_cols = [
    "Age",
    "Gender",
    "Work_Status",
    "Sleep_Hours",
    "Physical_Activity",
    "Stress_Level",
    "Depression_Score",
    "Anxiety_Score",
    "Mental_Health_History",
    "Chronic_Illness"
]

global_df = global_df[global_cols]

# Select useful columns from Sleep Dataset
sleep_cols = [
    "Age",
    "Gender",
    "Occupation",
    "Quality of Sleep",
    "BMI Category",
    "Daily Steps",
    "Sleep Disorder"
]

sleep_df = sleep_df[sleep_cols]

# Rename columns
sleep_df.rename(columns={
    "Quality of Sleep": "Quality_of_Sleep",
    "BMI Category": "BMI_Category",
    "Daily Steps": "Daily_Steps",
    "Sleep Disorder": "Sleep_Disorder"
}, inplace=True)

# Merge datasets on Age and Gender
master_df = pd.merge(
    global_df,
    sleep_df,
    on=["Age", "Gender"],
    how="left"
)

print("\nMaster Dataset Shape:", master_df.shape)

# Save master dataset
master_df.to_csv(
    "data/master_mental_health.csv",
    index=False
)

print("\nMaster Dataset Saved Successfully!")