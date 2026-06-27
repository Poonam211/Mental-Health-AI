def get_recommendations(risk_score):

    if risk_score >= 75:
        return [
            "Consult a mental health professional",
            "Practice meditation daily",
            "Maintain proper sleep schedule",
            "Reduce screen time"
        ]

    elif risk_score >= 50:
        return [
            "Exercise regularly",
            "Improve sleep habits",
            "Take regular breaks"
        ]

    else:
        return [
            "Continue healthy habits",
            "Maintain social connections"
        ]
    