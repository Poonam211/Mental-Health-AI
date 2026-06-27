import pandas as pd

df = pd.read_csv("data/cleaned_mental_health.csv")

print(df["Risk_Score"].describe())

print("\nMax Depression Score:")
print(df["Depression_Score"].max())

print("\nMax Anxiety Score:")
print(df["Anxiety_Score"].max())