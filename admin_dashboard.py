import streamlit as st
import pandas as pd
import plotly.express as px
st.set_page_config(
    page_title="India Mental Health Observatory",
    page_icon="🧠",
    layout="wide"
)

st.markdown("""
<style>

[data-testid="stDataFrame"] th {
    font-size: 30px !important;
    font-weight: bold !important;
}

[data-testid="stDataFrame"] td {
    font-size: 28px !important;
}

</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class='main-title'>
🧠 India Mental Health Observatory
</div>

<div class='sub-title'>
Real-Time Mental Health Analytics Across Indian Cities
</div>
""",
unsafe_allow_html=True)

# ----------------------------
# Custom CSS
# ----------------------------
st.markdown("""
<style>

/* Page Width */
.block-container{
    max-width:100% !important;
    padding-left:4rem !important;
    padding-right:4rem !important;
    padding-top:1rem !important;
}

/* Title */
.main-title{
    text-align:center;
    font-size:80px !important;
    font-weight:800 !important;
    color:#1E3A8A;
}

.sub-title{
    text-align:center;
    font-size:30px !important;
    color:#64748B;
    margin-bottom:40px;
}

/* Metrics */
div[data-testid="metric-container"]{
    padding:25px !important;
    border-radius:15px !important;
}

div[data-testid="stMetricLabel"]{
    font-size:24px !important;
    font-weight:700 !important;
}

div[data-testid="stMetricValue"]{
    font-size:52px !important;
    font-weight:800 !important;
}

/* Tabs */
.stTabs [data-baseweb="tab"]{
    font-size:24px !important;
    font-weight:700 !important;
}

/* Selectbox */
div[data-baseweb="select"] > div{
    min-height:70px !important;
    font-size:24px !important;
}

/* Labels */
label{
    font-size:24px !important;
    font-weight:700 !important;
}

/* Subheaders */
h3{
    font-size:38px !important;
    font-weight:700 !important;
}

/* General Text */
p{
    font-size:22px !important;
}

/* DataFrame */
[data-testid="stDataFrame"]{
    font-size:20px !important;
}

</style>
""", unsafe_allow_html=True)
# ----------------------------
# Load Data from FastAPI Backend
# ----------------------------
import requests

BACKEND_REPORTS_URL = "http://127.0.0.1:8000/api/reports"

try:
    response = requests.get(BACKEND_REPORTS_URL)
    if response.status_code == 200:
        reports_data = response.json()
        df = pd.DataFrame(reports_data)
    else:
        st.error(f"Failed to fetch reports from backend: {response.text}")
        df = pd.DataFrame()
except Exception as e:
    st.error(f"Connection to FastAPI backend failed: {e}")
    df = pd.DataFrame()

# Fallback: if data is empty, initialize columns to prevent crash
if df.empty:
    df = pd.DataFrame(columns=[
        "Timestamp", "City", "Latitude", "Longitude", "Occupation", "Age",
        "Risk_Score", "Risk_Level", "Mental_State", "Depression_Score",
        "Anxiety_Score", "Depression_Percent", "Anxiety_Percent", "Stress_Percent",
        "Wellness_Score"
    ])

if "Wellness_Score" not in df.columns and "Risk_Score" in df.columns:
    df["Wellness_Score"] = 100 - df["Risk_Score"]

# ----------------------------
# Age Groups
# ----------------------------

def age_group(age):

    if age <= 20:
        return "10-20"

    elif age <= 35:
        return "21-35"

    elif age <= 50:
        return "36-50"

    else:
        return "50+"

df["Age_Group"] = df["Age"].apply(age_group)

# ----------------------------
# Dashboard Summary
# ----------------------------

col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "Reports",
    len(df)
)

col2.metric(
    "Cities",
    df["City"].nunique()
)

col3.metric(
    "Avg Risk %",
    round(df["Risk_Score"].mean(), 2)
)

col4.metric(
    "Avg Wellness",
    round(df["Wellness_Score"].mean(), 2)
)

st.divider()

# ----------------------------
# City Search
# ----------------------------

st.subheader("🔍 City Search")

city_list = (
    df["City"]
    .dropna()
    .astype(str)
)

city_list = city_list[
    city_list.str.strip() != ""
]

selected_city = st.selectbox(
    "Select City",
    sorted(city_list.unique())
)

city_data = df[df["City"] == selected_city]

c1, c2, c3, c4 = st.columns(4)

c1.metric(
    "Reports",
    len(city_data)
)

c2.metric(
    "Risk %",
    round(city_data["Risk_Score"].mean(), 2)
)

c3.metric(
    "Anxiety %",
    round(city_data["Anxiety_Percent"].mean(), 2)
)

c4.metric(
    "Depression %",
    round(city_data["Depression_Percent"].mean(), 2)
)

st.divider()

# ----------------------------
# Tabs
# ----------------------------

tab1, tab2, tab3, tab4, tab5 = st.tabs(
    [
        "🏙️ City Analytics",
        "👥 Age Analytics",
        "💼 Occupation Analytics",
        "🏆 Rankings",
        "📄 Reports"
    ]
)

# ====================================================
# CITY ANALYTICS
# ====================================================

with tab1:

    city_order = (
        df.groupby("City")["Risk_Score"]
        .mean()
        .sort_values(ascending=False)
        .index
    )

    top_anxiety = (
        df.groupby("City")["Anxiety_Percent"]
        .mean()
        .reindex(city_order)
        .head(10)
    )

    top_depression = (
        df.groupby("City")["Depression_Percent"]
        .mean()
        .reindex(city_order)
        .head(10)
    )

    top_stress = (
        df.groupby("City")["Stress_Percent"]
        .mean()
        .reindex(city_order)
        .head(10)
    )

    healthy_cities = (
        df.groupby("City")["Wellness_Score"]
        .mean()
        .sort_values(ascending=False)
        .head(10)
    )

    col1, col2 = st.columns(2)

    with col1:

        anxiety_df = top_anxiety.reset_index()
        anxiety_df.columns = ["City", "Anxiety_Percent"]

        fig = px.bar(
            anxiety_df,
            x="City",
            y="Anxiety_Percent",
            text_auto=".1f",
            title="🏆 Top Anxiety Cities"
        )

        fig.update_layout(
            xaxis_title="City",
            yaxis_title="Anxiety %",
            height=750,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_traces(textfont_size=20)

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="anxiety_chart"
        )

    with col2:

        depression_df = top_depression.reset_index()
        depression_df.columns = ["City", "Depression_Percent"]

        fig = px.bar(
            depression_df,
            x="City",
            y="Depression_Percent",
            text_auto=".1f",
            title="🏆 Top Depression Cities"
        )

        fig.update_layout(
            xaxis_title="City",
            yaxis_title="Depression %",
            height=750,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="depression_chart"
        )

    stress_df = top_stress.reset_index()
    stress_df.columns = ["City", "Stress_Percent"]

    fig.update_layout(
        xaxis_title="City",
        yaxis_title="Stress %",
        height=750,
        font=dict(size=20),
        title_font_size=30
    )

    fig.update_layout(
        xaxis_title="City",
        yaxis_title="Stress %",
        height=650
    )

    fig.update_xaxes(
        categoryorder="total descending"
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
        key="stress_chart"
    )

    healthy_df = healthy_cities.reset_index()

    fig = px.bar(
        healthy_df,
        x="City",
        y="Wellness_Score",
        text_auto=".1f",
        title="🏆 Top Healthy Cities"
    )

    fig.update_layout(
        xaxis_title="City",
        yaxis_title="Wellness Score",
        height=750,
        font=dict(size=20),
        title_font_size=30
    )

    fig.update_xaxes(
        categoryorder="total descending"
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
        key="healthy_chart"
    )

    st.subheader("🗺️ India Mental Health Map")  
    city_map = (
    df.groupby("City")
    .agg({
        "Risk_Score": "mean",
        "Anxiety_Percent": "mean",
        "Depression_Percent": "mean",
        "Stress_Percent": "mean",
        "Latitude":"first",
        "Longitude":"first"
    })
    .round(2)
    .reset_index()
    )

    city_map = (
        df.groupby("City")
        .agg({
            "Risk_Score":"mean",
            "Anxiety_Percent":"mean",
            "Depression_Percent":"mean",
            "Stress_Percent":"mean",
            "Latitude":"first",
            "Longitude":"first"
        })
        .reset_index()
    )

    # Create Risk Zone

    def risk_zone(score):

        if score >= 60:
            return "High"

        elif score >= 45:
            return "Moderate"

        elif score >= 30:
            return "Medium"

        else:
            return "Low"


    city_map["Risk_Zone"] = city_map["Risk_Score"].apply(
        risk_zone
    )

    selected_city = st.selectbox(
    "🏙️ Select City",
    sorted(city_map["City"].unique())
    )

    city_info = city_map[
        city_map["City"] == selected_city
        ].iloc[0]

    # Interactive Mental Health Map
    fig = px.scatter_mapbox(

        city_map,

        lat="Latitude",
        lon="Longitude",
        size_max=40,
        size="Risk_Score",

        color="Risk_Zone",

        hover_name="City",

        hover_data=[
        "Risk_Score",
        "Anxiety_Percent",
        "Depression_Percent",
        "Stress_Percent"
    ],

    zoom=5.2,

    height=700,
    )
    color_discrete_map={
    "Low": "#22c55e",
    "Medium": "#eab308",
    "Moderate": "#f97316",
    "High": "#ef4444"
    }

    fig.update_layout(

    title="🗺️ India Mental Health Risk Map",

    mapbox_style="open-street-map",

    legend=dict(
        font=dict(size=18)
    ),

    margin=dict(
        l=0,
        r=0,
        t=50,
        b=0
    )
)

    col1, col2 = st.columns([3,1])

    with col1:

        st.plotly_chart(
        fig,
        use_container_width=True,
        key="india_risk_map"
        )

    with col2:

        st.markdown(f"## 🏙️ {selected_city}")

        st.metric(
        "Risk Score",
        f"{city_info['Risk_Score']:.1f}%"
        )
        
        st.metric(
        "Wellness Score",
        f"{100 - city_info['Risk_Score']:.1f}%"
        )

        st.progress(
        int(city_info["Risk_Score"])
        )

        st.metric(
        "Anxiety",
        f"{city_info['Anxiety_Percent']:.1f}%"
        )

        st.metric(
        "Depression",
        f"{city_info['Depression_Percent']:.1f}%"
        )

        st.metric(
        "Stress",
        f"{city_info['Stress_Percent']:.1f}%"
        )

        risk = city_info["Risk_Score"]

    if risk >= 60:

        st.error("🔴 HIGH RISK CITY")

    elif risk >= 45:

        st.warning("🟠 MODERATE RISK CITY")

    elif risk >= 30:

        st.info("🟡 MEDIUM RISK CITY")

    else:

        st.success("🟢 LOW RISK CITY")

    city_reports = df[df["City"] == selected_city]

    top_age_group = (
    city_reports
    .groupby("Age_Group")["Risk_Score"]
    .mean()
    .idxmax()
    )

    top_occupation = (
    city_reports
    .groupby("Occupation")["Risk_Score"]
    .mean()
    .idxmax()
)

    st.markdown("### 🤖 AI City Insight")

    st.info(
        f"""
    📍 City: {selected_city}

    👥 Highest Risk Age Group: {top_age_group}

    💼 Most Affected Occupation: {top_occupation}

    📊 Average Risk Score: {city_info['Risk_Score']:.1f}%

    This city shows elevated mental health concerns primarily among
    {top_age_group} age citizens and {top_occupation.lower()} groups.
    """
    )

    st.markdown("### 🤖 AI Recommendation")
    if risk >= 60:

        st.write(
        "High mental health risk detected. "
        "Counseling support and awareness programs are recommended."
    )

    elif risk >= 45:

        st.write(
        "Moderate risk detected. "
        "Mental wellness initiatives should be strengthened."
    )

    elif risk >= 30:

        st.write(
        "Mental health is relatively stable but should be monitored."
    )

    else:

        st.write(
        "This city shows healthy mental wellness indicators."
    )

# ====================================================
# AGE ANALYTICS
# ====================================================

with tab2:

    age_order = (
        df.groupby("Age_Group")["Risk_Score"]
        .mean()
        .sort_values(ascending=False)
        .index
    )

    age_risk = (
        df.groupby("Age_Group")["Risk_Score"]
        .mean()
        .round(2)
        .reindex(age_order)
    )

    age_anxiety = (
        df.groupby("Age_Group")["Anxiety_Percent"]
        .mean()
        .round(2)
        .reindex(age_order)
    )

    age_depression = (
        df.groupby("Age_Group")["Depression_Percent"]
        .mean()
        .round(2)
        .reindex(age_order)
    )

    col1, col2 = st.columns(2)

    # ----------------------------
    # Age Risk
    # ----------------------------

    with col1:

        age_risk_df = age_risk.reset_index()
        age_risk_df.columns = [
            "Age_Group",
            "Risk_Score"
        ]

        fig = px.bar(
            age_risk_df,
            x="Age_Group",
            y="Risk_Score",
            text_auto=".1f",
            title="👥 Age Wise Risk Score"
        )

        fig.update_layout(
            xaxis_title="Age Group",
            yaxis_title="Risk %",
            height=750,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="age_risk_chart"
        )

    # ----------------------------
    # Age Anxiety
    # ----------------------------

    with col2:

        age_anxiety_df = age_anxiety.reset_index()
        age_anxiety_df.columns = [
            "Age_Group",
            "Anxiety_Percent"
        ]

        fig = px.bar(
            age_anxiety_df,
            x="Age_Group",
            y="Anxiety_Percent",
            text_auto=".1f",
            title="👥 Age Wise Anxiety"
        )

        fig.update_layout(
            xaxis_title="Age Group",
            yaxis_title="Anxiety %",
            height=750,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="age_anxiety_chart"
        )

    # ----------------------------
    # Age Depression
    # ----------------------------

    age_depression_df = age_depression.reset_index()
    age_depression_df.columns = [
        "Age_Group",
        "Depression_Percent"
    ]

    fig = px.bar(
        age_depression_df,
        x="Age_Group",
        y="Depression_Percent",
        text_auto=".1f",
        title="👥 Age Wise Depression"
    )

    fig.update_layout(
        xaxis_title="Age Group",
        yaxis_title="Depression %",
        height=750,
        font=dict(size=20),
        title_font_size=30
    )

    fig.update_xaxes(
        categoryorder="total descending"
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
        key="age_depression_chart"
    )

# ====================================================
# OCCUPATION ANALYTICS
# ====================================================

with tab3:

    occupation_order = (
        df.groupby("Occupation")["Risk_Score"]
        .mean()
        .sort_values(ascending=False)
        .index
    )

    occupation_risk = (
        df.groupby("Occupation")["Risk_Score"]
        .mean()
        .reindex(occupation_order)
    )

    occupation_anxiety = (
        df.groupby("Occupation")["Anxiety_Percent"]
        .mean()
        .reindex(occupation_order)
    )

    occupation_depression = (
        df.groupby("Occupation")["Depression_Percent"]
        .mean()
        .reindex(occupation_order)
    )

    col1, col2 = st.columns(2)

    # --------------------------------
    # Occupation Risk
    # --------------------------------

    with col1:

        occupation_risk_df = occupation_risk.reset_index()
        occupation_risk_df.columns = [
            "Occupation",
            "Risk_Score"
        ]

        fig = px.bar(
            occupation_risk_df,
            x="Occupation",
            y="Risk_Score",
            text_auto=".1f",
            title="💼 Occupation Risk Score"
        )

        fig.update_layout(
            xaxis_title="Occupation",
            yaxis_title="Risk %",
            height=800,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="occupation_risk_chart"
        )

    # --------------------------------
    # Occupation Anxiety
    # --------------------------------

    with col2:

        occupation_anxiety_df = occupation_anxiety.reset_index()
        occupation_anxiety_df.columns = [
            "Occupation",
            "Anxiety_Percent"
        ]

        fig = px.bar(
            occupation_anxiety_df,
            x="Occupation",
            y="Anxiety_Percent",
            text_auto=".1f",
            title="💼 Occupation Anxiety"
        )

        fig.update_layout(
            xaxis_title="Occupation",
            yaxis_title="Anxiety %",
            height=800,
            font=dict(size=20),
            title_font_size=30
        )

        fig.update_xaxes(
            categoryorder="total descending"
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
            key="occupation_anxiety_chart"
        )

    # --------------------------------
    # Occupation Depression
    # --------------------------------

    occupation_depression_df = occupation_depression.reset_index()
    occupation_depression_df.columns = [
        "Occupation",
        "Depression_Percent"
    ]

    fig = px.bar(
        occupation_depression_df,
        x="Occupation",
        y="Depression_Percent",
        text_auto=".1f",
        title="💼 Occupation Depression"
    )

    fig.update_layout(
        xaxis_title="Occupation",
        yaxis_title="Depression %",
        height=800,
        font=dict(size=20),
        title_font_size=30
    )

    fig.update_xaxes(
        categoryorder="total descending"
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
        key="occupation_depression_chart"
    )

# ====================================================
# RANKINGS
# ====================================================

with tab4:

    st.header("🏆 India Mental Health Rankings")

    ranking_df = (
        df.groupby("City")
        .agg({
            "Risk_Score": "mean",
            "Anxiety_Percent": "mean",
            "Depression_Percent": "mean",
            "Stress_Percent": "mean"
        })
        .round(2)
        .reset_index()
    )

    ranking_df["Wellness_Score"] = (
        100 - ranking_df["Risk_Score"]
    )

    # Healthiest Cities

    st.subheader("🥇 Top Healthy Cities")

    healthy = (
        ranking_df
        .sort_values(
            by="Wellness_Score",
            ascending=False
        )
        .head(10)
        .reset_index(drop=True)
    )

    healthy.insert(
        0,
        "Rank",
        range(1, len(healthy) + 1)
    )

    st.dataframe(
        healthy[
            ["Rank", "City", "Wellness_Score"]
        ],
        use_container_width=True
    )

    # Critical Cities

    st.subheader("🚨 Most Critical Cities")

    critical = (
        ranking_df
        .sort_values(
            by="Risk_Score",
            ascending=False
        )
        .head(10)
        .reset_index(drop=True)
    )

    critical.insert(
        0,
        "Rank",
        range(1, len(critical) + 1)
    )

    st.dataframe(
        critical[
            ["Rank", "City", "Risk_Score"]
        ],
        use_container_width=True
    )

# ====================================================
# REPORTS
# ====================================================

with tab5:

    st.subheader("📄 Collected Reports")

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True
    )

    csv = df.to_csv(index=False).encode("utf-8")

    st.download_button(
        label="⬇️ Download Reports CSV",
        data=csv,
        file_name="mental_health_reports.csv",
        mime="text/csv"
    )