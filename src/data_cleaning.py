import pandas as pd

df = pd.read_csv("data/Global_Mental_Health_Dataset_2025.csv")

for col in [
    "Stress_Level",
    "Physical_Activity",
    "Mental_Health_History",
    "Chronic_Illness",
    "Treatment",
    "Outcome",
    "Work_Status"
]:
    print("\n" + "="*50)
    print(col)
    print(df[col].unique())