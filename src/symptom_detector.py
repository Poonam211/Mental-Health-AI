def detect_symptoms(text):

    text = text.lower()

    anxiety_keywords = [
        "nervous",
        "panic",
        "worry",
        "fear",
        "anxious",
        "anxiety",
        "worried"
    ]

    depression_keywords = [
        "sad",
        "hopeless",
        "worthless",
        "crying",
        "depressed",
        "empty"
    ]

    stress_keywords = [
        "pressure",
        "overwhelmed",
        "stress",
        "workload",
        "tension"
    ]

    anxiety_score = sum(
        word in text
        for word in anxiety_keywords
    )

    depression_score = sum(
        word in text
        for word in depression_keywords
    )

    stress_score = sum(
        word in text
        for word in stress_keywords
    )

    return {
        "Anxiety": anxiety_score,
        "Depression": depression_score,
        "Stress": stress_score
    }