import numpy as np
import nltk
import re
from typing import Dict, List, Any

_transformer_model = None
_vader_sia = None

# Anchors for semantic similarity mapping
ANXIETY_ANCHORS = [
    "I feel very anxious, nervous, panicked, and worried. I have fear, restless energy, and racing thoughts.",
    "I am experiencing panic attacks, severe anxiety, and constant worry about everything.",
    "I feel jittery, tense, unable to relax, and constant dread."
]

DEPRESSION_ANCHORS = [
    "I feel deeply sad, depressed, empty, hopeless, and down. I have lost interest in things I used to enjoy.",
    "I feel worthless, crying, empty, and experiencing a lack of energy or joy.",
    "I feel miserable, low, anhedonic, and have zero motivation."
]

STRESS_ANCHORS = [
    "I feel completely overwhelmed, under severe stress, and burnout. I have high workload pressure and tension.",
    "There is too much pressure on me, causing work tension, chronic fatigue, and exhaustion.",
    "I am struggling with stress, heavy workload, pressure, and tension."
]

INTENT_HELP_ANCHORS = [
    "I need professional help, counseling, therapy, or clinical support.",
    "I want to talk to a therapist or doctor about my mental health.",
    "I want consultation, support, and clinical guidelines."
]

INTENT_CRISIS_ANCHORS = [
    "I have self-harm thoughts, feeling suicidal, in severe emergency crisis, and want to end it.",
    "I need immediate emergency helpline crisis counseling and support.",
    "I want to end my life, feeling suicidal, severe crisis emergency."
]

BURNOUT_ANCHORS = [
    "I am feeling completely exhausted, drained, and burnt out from work or studies.",
    "I have no motivation, constant fatigue, academic or professional burnout, and energy depletion.",
    "I feel over-extended, underappreciated, and mentally exhausted by my routine."
]

ISOLATION_ANCHORS = [
    "I feel lonely, isolated, cut off from people, and have no social support.",
    "I am withdrawing from friends, feeling disconnected, lonely, and alienated.",
    "I have no one to talk to and feel entirely alone in this city."
]

RELATIONSHIP_ANCHORS = [
    "I am having conflicts with my partner, family, or friends.",
    "Relationship issues, arguments, fights, and feeling misunderstood in relationships.",
    "I am struggling with marriage or family trouble, breakups, and relational tension."
]

FINANCIAL_ANCHORS = [
    "I am worried about money, debt, bills, and financial pressure.",
    "Severe financial stress, struggling to pay bills, and money issues.",
    "I have stress from expenses, loans, debt, and lack of stable income."
]

HEALTH_ANCHORS = [
    "I am worried about my physical health, illness, chronic pain, or disease.",
    "Health anxiety, constant fear of being sick, and health issues.",
    "I am dealing with chronic illness, symptoms, and medical problems."
]

SLEEP_ANCHORS = [
    "I can't sleep, suffering from insomnia, waking up early, and sleep deprivation.",
    "Poor sleep quality, sleeping too much or too little, and night terrors.",
    "I stay up all night, tossing and turning, having disrupted sleep cycles."
]

EATING_ANCHORS = [
    "I am skipping meals, emotional eating, overeating, or loss of appetite.",
    "Irregular eating habits, eating junk food, and nutritional issues.",
    "My diet is unbalanced, I eat irregular meals, and skip breakfast."
]

# Cache of anchor embeddings to avoid recalculating on each request
_anchors_cached = False
_anchor_embeddings = {}

# Stressor Classifier Keywords
STRESSOR_KEYWORDS = {
    "Academic Pressure / Exams": ["exam", "midterm", "final", "test", "grade", "study", "placement", "academic", "class", "homework", "thesis", "professor", "university", "college"],
    "Workload & Career": ["work", "job", "career", "boss", "colleague", "deadline", "office", "workload", "client", "employment", "meeting", "manager", "promotion"],
    "Financial Worries": ["money", "loan", "debt", "financial", "bill", "rent", "expense", "fee", "cost", "broke", "salary", "pay"],
    "Relationship & Family Conflict": ["relationship", "partner", "spouse", "husband", "wife", "boyfriend", "girlfriend", "family", "parent", "mother", "father", "brother", "sister", "friend", "argument", "fight", "conflict", "divorce"],
    "Health & Wellness Stress": ["health", "sick", "illness", "disease", "pain", "medical", "clinic", "hospital", "doctor", "chronic", "body", "injury"],
    "Social Isolation & Loneliness": ["lonely", "loneliness", "isolated", "isolation", "no friends", "alone", "cut off", "withdrawal", "ignored", "alienated"]
}

# Emotion Keywords
EMOTION_KEYWORDS = {
    "Overwhelmed": ["overwhelmed", "buried", "drowning", "too much", "cannot cope", "under pressure"],
    "Anxious": ["anxious", "anxiety", "panic", "panicked", "nervous", "worry", "worried", "fear", "restless", "dread"],
    "Depressed / Sad": ["sad", "depressed", "depression", "empty", "hopeless", "worthless", "crying", "miserable", "low", "unhappy"],
    "Exhausted": ["exhausted", "tired", "fatigue", "burnt out", "burnout", "drained", "sleepy", "lethargic"],
    "Angry / Irritated": ["angry", "mad", "irritated", "frustrated", "annoyed", "pissed", "furious"],
    "Lonely": ["lonely", "isolated", "alone", "disconnected", "ignored"]
}

# Lifestyle Issue Keywords
LIFESTYLE_KEYWORDS = {
    "Sleep Deprivation": ["no sleep", "insomnia", "awake all night", "lack of sleep", "sleepy", "tired", "exhausted", "waking up", "can't sleep"],
    "Nutritional Issues / Skipped Meals": ["skipping meals", "skip meal", "junk food", "irregular eating", "eating habits", "no appetite", "overeating", "binge eating"],
    "Sedentary Routine": ["no exercise", "sedentary", "sitting all day", "lazy", "inactive", "couch potato"],
    "Work-Life Imbalance": ["working late", "no breaks", "overtime", "no free time", "constantly working"]
}

def cosine_similarity(a, b):
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return np.dot(a, b) / (norm_a * norm_b)

def detect_symptoms(text: str) -> Dict[str, Any]:
    global _transformer_model, _vader_sia, _anchors_cached, _anchor_embeddings
    
    text = text.strip()
    if not text or text.lower() == "warmup":
        return {
            "Anxiety": 0,
            "Depression": 0,
            "Stress": 0,
            "Intent_Seeking_Help": 0,
            "Intent_Crisis_Alert": 0,
            "Sentiment_Negative": 0,
            "primary_stressor": "None",
            "secondary_stressor": "None",
            "detected_emotions": [],
            "lifestyle_problems": [],
            "burnout_score": 0,
            "social_isolation_score": 0,
            "relationship_problems_score": 0,
            "financial_stress_score": 0,
            "health_stress_score": 0,
            "explainable_summary": "No symptom narration provided for clinical extraction.",
            "personalized_recommendations": []
        }
        
    # 1. Initialize NLTK VADER for valence boosting
    try:
        if _vader_sia is None:
            try:
                nltk.download('vader_lexicon', quiet=True)
            except Exception:
                pass
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            _vader_sia = SentimentIntensityAnalyzer()
        vader_res = _vader_sia.polarity_scores(text)
        neg_val = vader_res["neg"]
        compound = vader_res["compound"]
    except Exception:
        neg_val = 0.2
        compound = 0.0

    # 2. Semantic Analysis using SentenceTransformers
    use_ml_nlp = True
    similarities = {}
    
    try:
        if _transformer_model is None:
            from sentence_transformers import SentenceTransformer
            _transformer_model = SentenceTransformer('all-MiniLM-L6-v2')
            
        if not _anchors_cached:
            _anchor_embeddings["anxiety"] = _transformer_model.encode(ANXIETY_ANCHORS)
            _anchor_embeddings["depression"] = _transformer_model.encode(DEPRESSION_ANCHORS)
            _anchor_embeddings["stress"] = _transformer_model.encode(STRESS_ANCHORS)
            _anchor_embeddings["help"] = _transformer_model.encode(INTENT_HELP_ANCHORS)
            _anchor_embeddings["crisis"] = _transformer_model.encode(INTENT_CRISIS_ANCHORS)
            
            _anchor_embeddings["burnout"] = _transformer_model.encode(BURNOUT_ANCHORS)
            _anchor_embeddings["isolation"] = _transformer_model.encode(ISOLATION_ANCHORS)
            _anchor_embeddings["relationship"] = _transformer_model.encode(RELATIONSHIP_ANCHORS)
            _anchor_embeddings["financial"] = _transformer_model.encode(FINANCIAL_ANCHORS)
            _anchor_embeddings["health"] = _transformer_model.encode(HEALTH_ANCHORS)
            _anchor_embeddings["sleep"] = _transformer_model.encode(SLEEP_ANCHORS)
            _anchor_embeddings["eating"] = _transformer_model.encode(EATING_ANCHORS)
            
            _anchors_cached = True
            
        text_emb = _transformer_model.encode(text)
        
        # Calculate maximum similarities for all dimensions
        for key in _anchor_embeddings.keys():
            similarities[key] = max(cosine_similarity(text_emb, ref) for ref in _anchor_embeddings[key])
            
    except Exception as e:
        use_ml_nlp = False
        print(f"Transformers pipeline fallback triggered in Intelligence Engine: {e}")

    # 3. Score Scaling
    def scale_score(sim, valence):
        norm = (sim - 0.1) / 0.7
        norm = max(0.0, min(1.0, norm))
        final = 0.8 * norm + 0.2 * valence
        return int(round(final * 10))

    if use_ml_nlp:
        anxiety_score = scale_score(similarities["anxiety"], neg_val)
        dep_score = scale_score(similarities["depression"], neg_val)
        stress_score = scale_score(similarities["stress"], neg_val)
        
        intent_help = int(round(max(0.0, min(1.0, (similarities["help"] - 0.1) / 0.6)) * 10))
        intent_crisis = int(round(max(0.0, min(1.0, (similarities["crisis"] - 0.1) / 0.6)) * 10))
        
        burnout_score = scale_score(similarities["burnout"], neg_val)
        isolation_score = scale_score(similarities["isolation"], neg_val)
        relationship_score = scale_score(similarities["relationship"], neg_val)
        financial_score = scale_score(similarities["financial"], neg_val)
        health_score = scale_score(similarities["health"], neg_val)
        
        # Dial down scores if sentiment is strongly positive
        if compound > 0.4:
            anxiety_score = max(0, anxiety_score - 3)
            dep_score = max(0, dep_score - 3)
            stress_score = max(0, stress_score - 3)
            intent_crisis = max(0, intent_crisis - 4)
            intent_help = max(0, intent_help - 3)
            burnout_score = max(0, burnout_score - 2)
            isolation_score = max(0, isolation_score - 2)
            
    else:
        # Fallback lexical scores
        text_lower = text.lower()
        
        def keyword_score(words):
            score = sum(word in text_lower for word in words)
            return min(10, score * 2 + int(neg_val * 6))
            
        anxiety_score = keyword_score(ANXIETY_ANCHORS[0].lower().split())
        dep_score = keyword_score(DEPRESSION_ANCHORS[0].lower().split())
        stress_score = keyword_score(STRESS_ANCHORS[0].lower().split())
        intent_help = keyword_score(INTENT_HELP_ANCHORS[0].lower().split())
        intent_crisis = keyword_score(INTENT_CRISIS_ANCHORS[0].lower().split())
        
        burnout_score = keyword_score(["burnout", "exhausted", "fatigue", "drained"])
        isolation_score = keyword_score(["lonely", "isolated", "alone", "loneliness"])
        relationship_score = keyword_score(["relationship", "partner", "argument", "conflict"])
        financial_score = keyword_score(["money", "loan", "financial", "debt"])
        health_score = keyword_score(["health", "sick", "illness", "hospital"])

    # 4. Stressor, Emotion & Lifestyle parsing
    text_lower = text.lower()
    
    # Stressors
    stressor_scores = {}
    for cat, keywords in STRESSOR_KEYWORDS.items():
        match_count = sum(len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower)) for kw in keywords)
        # Add semantic boost if available
        semantic_boost = 0.0
        if use_ml_nlp:
            if "Academic" in cat:
                semantic_boost = similarities["stress"] * 1.5
            elif "Workload" in cat:
                semantic_boost = similarities["burnout"] * 1.5
            elif "Financial" in cat:
                semantic_boost = similarities["financial"] * 2.0
            elif "Relationship" in cat:
                semantic_boost = similarities["relationship"] * 2.0
            elif "Health" in cat:
                semantic_boost = similarities["health"] * 2.0
            elif "Social" in cat:
                semantic_boost = similarities["isolation"] * 2.0
        stressor_scores[cat] = match_count + (semantic_boost * 3)

    sorted_stressors = sorted([k for k, v in stressor_scores.items() if v > 0.3], key=lambda x: stressor_scores[x], reverse=True)
    primary_stressor = sorted_stressors[0] if len(sorted_stressors) > 0 else "None"
    secondary_stressor = sorted_stressors[1] if len(sorted_stressors) > 1 else "None"
    
    # Emotions
    detected_emotions = []
    for emotion, keywords in EMOTION_KEYWORDS.items():
        match_count = sum(len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower)) for kw in keywords)
        if match_count > 0 or (use_ml_nlp and (
            (emotion == "Anxious" and similarities["anxiety"] > 0.4) or
            (emotion == "Depressed / Sad" and similarities["depression"] > 0.4) or
            (emotion == "Exhausted" and similarities["burnout"] > 0.4) or
            (emotion == "Lonely" and similarities["isolation"] > 0.4)
        )):
            detected_emotions.append(emotion)
            
    # Lifestyle
    lifestyle_problems = []
    for issue, keywords in LIFESTYLE_KEYWORDS.items():
        match_count = sum(len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower)) for kw in keywords)
        if match_count > 0 or (use_ml_nlp and (
            (issue == "Sleep Deprivation" and similarities["sleep"] > 0.45) or
            (issue == "Nutritional Issues / Skipped Meals" and similarities["eating"] > 0.45)
        )):
            lifestyle_problems.append(issue)

    # 5. Generate Explainable Summary (NLG)
    summary_parts = []
    summary_parts.append(f"AI Clinical Analysis of symptom narrative:")
    if primary_stressor != "None":
        summary_parts.append(f"The primary stress driver detected is **{primary_stressor}**.")
        if secondary_stressor != "None":
            summary_parts.append(f"Relational stress analysis also indicates **{secondary_stressor}** is a secondary stress factor.")
    else:
        summary_parts.append("The narration indicates generalized emotional fatigue without a singular prominent external stress trigger.")

    if detected_emotions:
        summary_parts.append(f"Strong emotional patterns corresponding to **{', '.join(detected_emotions).lower()}** are present in the text.")
        
    if lifestyle_problems:
        summary_parts.append(f"Active wellness disruptions are noted in lifestyle behaviors: **{', '.join(lifestyle_problems).lower()}**.")
        
    summary_parts.append(f"This matches an index of {anxiety_score}/10 for Anxiety indicators and {dep_score}/10 for Depressive symptoms.")
    explainable_summary = " ".join(summary_parts)

    # 6. Generate Dynamic Recommendations
    personalized_recs = []
    if intent_crisis >= 6:
        personalized_recs.append("CRITICAL: Seek immediate clinical therapy. Call AASRA Helpline (+91-9820466726) for emergency support.")
        
    if "Academic" in primary_stressor or "Academic" in secondary_stressor:
        personalized_recs.append("Mitigate academic pressure spikes by practicing time-blocking and regular decompression breaks.")
        personalized_recs.append("Consult a campus counselor or wellness mentor to address placement-related anxiety.")
    if "Workload" in primary_stressor or "Workload" in secondary_stressor:
        personalized_recs.append("Practice professional boundary-setting; disable work notifications after business hours.")
        personalized_recs.append("Integrate 5-minute micro-breaks during high-pressure work blocks to lower burnout risk.")
    if "Financial" in primary_stressor or "Financial" in secondary_stressor:
        personalized_recs.append("Set a clear student/family budget using sheets to reduce panic around immediate bills.")
    if "Relationship" in primary_stressor or "Relationship" in secondary_stressor:
        personalized_recs.append("Allocate clear quality time to talk constructively with partners/family members.")
    if "Social" in primary_stressor or "Social" in secondary_stressor:
        personalized_recs.append("Actively schedule one phone call or social interaction with a close friend weekly.")
        
    if "Sleep Deprivation" in lifestyle_problems:
        personalized_recs.append("Establish sleep targets: switch off digital screens 1 hour before sleeping.")
    if "Nutritional Issues / Skipped Meals" in lifestyle_problems:
        personalized_recs.append("Schedule meals at consistent times to regulate blood sugar and boost physical energy.")

    if not personalized_recs:
        personalized_recs.append("Maintain positive routines for sleep, healthy eating, and physical mobility.")
        personalized_recs.append("Practice daily sensory grounding exercises (such as the 5-4-3-2-1 sensory method) to manage acute stressors.")

    return {
        "Anxiety": anxiety_score,
        "Depression": dep_score,
        "Stress": stress_score,
        "Intent_Seeking_Help": intent_help,
        "Intent_Crisis_Alert": intent_crisis,
        "Sentiment_Negative": int(neg_val * 10),
        
        # New Structured NLP Outputs
        "primary_stressor": primary_stressor,
        "secondary_stressor": secondary_stressor,
        "detected_emotions": detected_emotions,
        "lifestyle_problems": lifestyle_problems,
        "burnout_score": burnout_score,
        "social_isolation_score": isolation_score,
        "relationship_problems_score": relationship_score,
        "financial_stress_score": financial_score,
        "health_stress_score": health_score,
        "explainable_summary": explainable_summary,
        "personalized_recommendations": personalized_recs
    }