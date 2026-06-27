import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

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
y = df["Risk_Level"]

# Encode target
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:")
print(accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(
    model,
    "models/risk_level_model.pkl"
)

joblib.dump(label_encoder,"models/risk_level_encoder.pkl")
joblib.dump(gender_encoder, "models/gender_encoder.pkl")
joblib.dump(work_encoder, "models/work_encoder.pkl")
joblib.dump(activity_encoder, "models/activity_encoder.pkl")
joblib.dump(history_encoder, "models/history_encoder.pkl")
joblib.dump(illness_encoder, "models/illness_encoder.pkl")

print("\nModel Saved Successfully!")