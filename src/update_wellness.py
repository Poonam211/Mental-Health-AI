import pandas as pd

df = pd.read_csv("data/city_reports.csv")

df["Wellness_Score"] = 100 - df["Risk_Score"]

df.to_csv(
    "data/city_reports.csv",
    index=False
)

print("Wellness Score Added Successfully")