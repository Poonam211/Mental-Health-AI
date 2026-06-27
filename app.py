import streamlit as st
import pandas as pd
import requests

# FastAPI Backend URL
BACKEND_URL = "http://127.0.0.1:8000/api/assessment/predict"


st.set_page_config(
    page_title="Mental Health Risk Assessment",
    page_icon="🧠",
    layout="wide"
)

st.markdown("""
<style>

/* -----------------------------
   Main Container
----------------------------- */

.block-container {
    max-width: 100% !important;
    padding-left: 4rem !important;
    padding-right: 4rem !important;
    padding-top: 1rem !important;
}

/* -----------------------------
   Main Title
----------------------------- */

h1 {
    font-size: 85px !important;
    font-weight: 800 !important;
}

h2 {
    font-size: 50px !important;
    font-weight: 700 !important;
}

h3 {
    font-size: 32px !important;
    font-weight: 600 !important;
}

/* Labels */
label {
    font-size: 26px !important;
    font-weight: 600 !important;
}

/* -----------------------------
   Select Boxes
----------------------------- */

.stSelectbox div[data-baseweb="select"] {
    font-size: 28px !important;
    min-height: 80px !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.stSelectbox span {
    font-size: 28px !important;
}

/* Dropdown options */
div[role="option"] {
    font-size: 24px !important;
    min-height: 55px !important;
    display: flex !important;
    align-items: center !important;
}
div[data-baseweb="select"] > div {
    min-height: 80px !important;
    font-size: 26px !important;
    display: flex !important;
    align-items: center !important;
}


/* Selected value */
div[data-baseweb="select"] span {
    font-size: 24px !important;
    line-height: 70px !important;
}

            
/* -----------------------------
   Text Inputs
----------------------------- */

/* Text Input Box */
.stTextInput > div > div > input {
    height: 80px !important;
    font-size: 24px !important;
    padding: 12px !important;
}

/* Placeholder */
.stTextInput input::placeholder {
    font-size: 24px !important;
}

.stTextInput > div > div > input {
    height: 90px !important;
    font-size: 28px !important;
}           

/* Text Input Container */
.stTextInput > div {
    min-height: 80px !important;
}
            
/* Text Area */
.stTextArea textarea {
    font-size: 24px !important;
    min-height: 180px !important;
}


/* -----------------------------
   Slider
----------------------------- */

.stSlider {
    font-size: 26px !important;
}

/* -----------------------------
   Paragraphs / Questions
----------------------------- */

p {
    font-size: 28px !important;
    line-height: 2 !important;
}
/* -----------------------------
   Buttons
----------------------------- */

.stButton button {
    font-size: 30px !important;
    font-weight: bold !important;
    height: 85px !important;
    width: 450px !important;
    border-radius: 15px !important;
}

/* -----------------------------
   Metrics
----------------------------- */

[data-testid="stMetric"] {
    background: #F8FAFC;
    padding: 20px;
    border-radius: 15px;
    border: 1px solid #E2E8F0;
}

[data-testid="stMetricValue"] {
    font-size: 34px !important;
}

[data-testid="stMetricLabel"] {
    font-size: 20px !important;
}

/* -----------------------------
   Expanders
----------------------------- */

.streamlit-expanderHeader {
    font-size: 24px !important;
    font-weight: 600 !important;
}

/* -----------------------------
   DataFrames
----------------------------- */

[data-testid="stDataFrame"] {
    font-size: 18px !important;
}

</style>
""", unsafe_allow_html=True)
st.markdown("""
<h1 style='
text-align:center;
color:#1E3A8A;
margin-bottom:10px;'>
🧠 Mental Health Risk Assessment System
</h1>

<p style='
text-align:center;
font-size:28px;
color:#64748B;
margin-bottom:30px;'>
AI Powered Mental Health Assessment & City Analytics
</p>
""", unsafe_allow_html=True)

# Inputs
st.markdown("""
<div style="
background:#F8FAFC;
padding:25px;
border-radius:15px;
border:1px solid #E2E8F0;
margin-bottom:20px;">
<h2>👤 Personal Information</h2>
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns([1,1])

with col1:
    age = st.slider("Age", 10, 100, 25)

    city = st.text_input(
        "City Name",
        placeholder="Pune"
    )

    gender = st.selectbox(
        "Gender",
        ["Male", "Female"]
    )

with col2:
    occupation = st.selectbox(
        "Occupation",
        [
            "Student",
            "Employee",
            "Farmer",
            "Homemaker",
            "Business",
            "Freelancer",
            "Painter",
            "Retired",
            "Unemployed",
            "Other"
        ]
    )

    physical_activity = st.selectbox(
        "Physical Activity",
        ["Low", "Moderate", "High"]
    )

    mental_history = st.selectbox(
        "Mental Health History",
        ["No", "Yes"]
    )

st.markdown("""
<div style="
background:#F8FAFC;
padding:25px;
border-radius:15px;
border:1px solid #E2E8F0;
margin-bottom:20px;">
<h2>🏥 Health Information</h2>
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns(2)

with col1:
    chronic_illness = st.selectbox(
        "Chronic Illness",
        ["No", "Yes"]
    )

with col2:
    sleep_hours = st.slider(
        "Sleep Hours",
        1.0,
        12.0,
        7.0
    )

days_of_treatment = st.slider(
    "Days of Treatment",
    0,
    365,
    30
)
with st.container():
    st.markdown("""
<h2 style='font-size:38px;'>
📋 Depression Assessment (PHQ-9)
</h2>
""", unsafe_allow_html=True)
options = {
    "Not at all": 0,
    "Several days": 1,
    "More than half the days": 2,
    "Nearly every day": 3
}

phq1 = st.selectbox(
    "Little interest or pleasure in doing things",
    options.keys()
)

phq2 = st.selectbox(
    "Feeling down, depressed, or hopeless",
    options.keys()
)

phq3 = st.selectbox(
    "Trouble falling or staying asleep",
    options.keys()
)

phq4 = st.selectbox(
    "Feeling tired or having little energy",
    options.keys()
)

phq5 = st.selectbox(
    "Poor appetite or overeating",
    options.keys()
)

phq6 = st.selectbox(
    "Feeling bad about yourself",
    options.keys()
)

phq7 = st.selectbox(
    "Trouble concentrating",
    options.keys()
)

phq8 = st.selectbox(
    "Moving or speaking slowly/restlessly",
    options.keys()
)

phq9 = st.selectbox(
    "Thoughts of self-harm",
    options.keys()
)

st.markdown("""
<h2 style='font-size:38px;'>
📋 Anxiety Assessment (GAD-7)
</h2>
""", unsafe_allow_html=True)

gad1 = st.selectbox(
    "Feeling nervous, anxious or on edge",
    options.keys()
)

gad2 = st.selectbox(
    "Not being able to stop worrying",
    options.keys()
)

gad3 = st.selectbox(
    "Worrying too much",
    options.keys()
)

gad4 = st.selectbox(
    "Trouble relaxing",
    options.keys()
)

gad5 = st.selectbox(
    "Being restless",
    options.keys()
)

gad6 = st.selectbox(
    "Becoming easily annoyed",
    options.keys()
)

gad7 = st.selectbox(
    "Feeling afraid something awful may happen",
    options.keys()
)
st.markdown("""
<h2 style='font-size:38px;'>
📝 Describe Your Symptoms
</h2>
""", unsafe_allow_html=True)

symptoms = st.text_area(
    "Enter your symptoms",
    placeholder="I feel nervous all day, can't sleep, and worry constantly..."
)

col1, col2, col3 = st.columns([1,1,1])

with col2:
    predict_btn = st.button(
        "🔍 Predict Mental Health Risk",
        use_container_width=True
    )
if predict_btn:
    # Gather PHQ-9 and GAD-7 answers
    phq_answers = [phq1, phq2, phq3, phq4, phq5, phq6, phq7, phq8, phq9]
    gad_answers = [gad1, gad2, gad3, gad4, gad5, gad6, gad7]
    
    # Construct payload
    payload = {
        "age": age,
        "city": city if city.strip() != "" else "Pune",
        "gender": gender,
        "occupation": occupation,
        "physical_activity": physical_activity,
        "mental_history": mental_history,
        "chronic_illness": chronic_illness,
        "sleep_hours": sleep_hours,
        "days_of_treatment": days_of_treatment,
        "phq_answers": phq_answers,
        "gad_answers": gad_answers,
        "symptoms": symptoms
    }
    
    try:
        # Call FastAPI backend
        response = requests.post(BACKEND_URL, json=payload)
        if response.status_code == 200:
            result = response.json()
            
            # Extract variables for rendering
            risk_score = result["risk_score"]
            wellness_score = result["wellness_score"]
            risk_level = result["risk_level"]
            mental_state = result["mental_state"]
            depression_score = result["depression_score"]
            anxiety_score = result["anxiety_score"]
            depression_percent = result["depression_percent"]
            anxiety_percent = result["anxiety_percent"]
            stress_percent = result["stress_percent"]
            symptom_result = result["symptom_analysis"]
            
            # Display Results exactly as before
            col1, col2 = st.columns(2)

            with col1:
                st.metric(
                    "Mental Health Risk Score",
                    f"{risk_score:.2f}%"
                )

            with col2:
                st.metric(
                    "Mental Wellness Score",
                    f"{wellness_score:.2f}/100"
                )

            st.progress(min(int(risk_score), 100))

            st.info(f"Risk Level: {risk_level}")

            st.warning(f"Mental State: {mental_state}")

            st.subheader("Detailed Analysis")

            st.write(f"PHQ-9 Depression Score: {depression_score}/27")

            st.write(f"GAD-7 Anxiety Score: {anxiety_score}/21")

            st.write(f"🔴 Depression Risk: {depression_percent:.2f}%")

            st.write(f"🟠 Anxiety Risk: {anxiety_percent:.2f}%")

            st.write(f"🟡 Stress Risk: {stress_percent:.2f}%")

            st.write(f"🟡 Overall Mental Health Risk: {risk_score:.2f}%")

            st.subheader("🤖 AI Symptom Analysis")

            st.subheader("💡 Recommendations")

            st.write(
            f"Anxiety Indicators Found: {symptom_result['Anxiety']}"
            )

            st.write(
            f"Depression Indicators Found: {symptom_result['Depression']}"
            )

            st.write(
            f"Stress Indicators Found: {symptom_result['Stress']}"
            )
            
            st.subheader("💡 Recommendations & Remedies")

            if depression_score >= 20:

                st.error("Severe Depression Detected")

                st.write("• Consult a mental health professional.")
                st.write("• Talk with trusted family or friends.")
                st.write("• Maintain a healthy sleep routine.")
                st.write("• Seek immediate help if self-harm thoughts occur.")

            elif depression_score >= 15:

                st.warning("Moderate Depression Detected")

                st.write("• Increase social interaction.")
                st.write("• Exercise regularly.")
                st.write("• Maintain a daily routine.")

            elif anxiety_score >= 10:

                st.warning("Anxiety Symptoms Detected")
                st.write("• Practice deep breathing exercises.")
                st.write("• Reduce caffeine intake.")
                st.write("• Practice mindfulness meditation.")

            elif risk_score >= 40:

                st.warning("Stress Symptoms Detected")
                st.write("• Take regular breaks.")
                st.write("• Improve work-life balance.")
                st.write("• Exercise and sleep adequately.")
            else:

                st.success("Healthy Mental State")
                st.write("• Continue healthy habits.")
                st.write("• Maintain social connections.")
                st.write("• Stay physically active.")
            
            st.success("Report Saved Successfully!")
        else:
            st.error(f"Error from Backend: {response.text}")
    except Exception as e:
        st.error(f"Failed to connect to FastAPI backend: {e}")