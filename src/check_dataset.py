import pandas as pd

df = pd.read_csv("data/cleaned_mental_health.csv")

print("\nRisk Level Distribution:")
print(df["Risk_Level"].value_counts())

print("\nMental State Distribution:")
print(df["Mental_State"].value_counts())

print("\nWork Status Distribution:")
print(df["Work_Status"].value_counts())