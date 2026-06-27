import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score

# Load dataset
df = pd.read_csv("data/cleaned_mental_health.csv")

# Encode categorical columns
gender_encoder = LabelEncoder()
df["Gender"] = gender_encoder.fit_transform(df["Gender"])

work_encoder = LabelEncoder()
df["Work_Status"] = work_encoder.fit_transform(df["Work_Status"])

activity_encoder = LabelEncoder()
df["Physical_Activity"] = activity_encoder.fit_transform(df["Physical_Activity"])

history_encoder = LabelEncoder()
df["Mental_Health_History"] = history_encoder.fit_transform(df["Mental_Health_History"])

illness_encoder = LabelEncoder()
df["Chronic_Illness"] = illness_encoder.fit_transform(df["Chronic_Illness"])

# Features
features = [
    "Age",
    "Depression_Score",
    "Anxiety_Score",
    "Sleep_Hours",
    "Days_of_Treatment",
    "Gender",
    "Work_Status",
    "Physical_Activity",
    "Mental_Health_History",
    "Chronic_Illness"
]

X = df[features]

# Target
y = df["Risk_Score"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Model
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Prediction
y_pred = model.predict(X_test)

print("\nMAE:")
print(mean_absolute_error(y_test, y_pred))

print("\nR2 Score:")
print(r2_score(y_test, y_pred))

# Save model
joblib.dump(
    model,
    "models/risk_score_model.pkl"
)

print("\nRegressor Saved Successfully!")