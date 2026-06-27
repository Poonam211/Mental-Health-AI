import pandas as pd

df = pd.read_csv("data/cleaned_mental_health.csv")

print(df["Gender"].unique())
print(df["Work_Status"].unique())
print(df["Physical_Activity"].unique())
print(df["Mental_Health_History"].unique())
print(df["Chronic_Illness"].unique())