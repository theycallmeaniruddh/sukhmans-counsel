import os
import json
import re
import random
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
import os

api_key = os.getenv("GEMINI_API_KEY")

# Primary working model for Google GenAI SDK in this environment
PRIMARY_MODEL = "gemini-3.5-flash-lite"
FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"]

# Helper to extract clean JSON from LLM output
def extract_json(text):
    text = text.strip()
    # Strip markdown code fences if present
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        clean = match.group(1).strip()
    else:
        clean = text
    
    # Try finding JSON array or object
    try:
        return json.loads(clean)
    except Exception:
        pass
    
    # Try finding first [ and last ]
    start_bracket = clean.find('[')
    end_bracket = clean.rfind(']')
    if start_bracket != -1 and end_bracket != -1:
        try:
            return json.loads(clean[start_bracket:end_bracket+1])
        except Exception:
            pass

    # Try finding first { and last }
    start_brace = clean.find('{')
    end_brace = clean.rfind('}')
    if start_brace != -1 and end_brace != -1:
        try:
            return json.loads(clean[start_brace:end_brace+1])
        except Exception:
            pass

    return None

def shuffle_question(question):
    """
    Shuffles the options of a question and updates the 'correct' index.
    Eliminates bias towards any single option (like B) and guarantees
    answers are uniformly, randomly distributed across A, B, C, and D.
    """
    if not isinstance(question, dict):
        return question

    raw_options = []
    for opt in question.get("options", []):
        cleaned = re.sub(r'^[A-D\d][\.\)]\s*', '', str(opt)).strip()
        raw_options.append(cleaned)

    if len(raw_options) < 4:
        return question

    orig_correct = question.get("correct", 0)
    try:
        orig_correct = int(orig_correct)
    except (ValueError, TypeError):
        orig_correct = 0

    if orig_correct < 0 or orig_correct >= len(raw_options):
        orig_correct = 0

    # Tag options with whether they are the correct answer
    tagged = [{"text": text, "is_correct": (idx == orig_correct)} for idx, text in enumerate(raw_options[:4])]
    random.shuffle(tagged)

    letters = ['A', 'B', 'C', 'D']
    new_options = []
    new_correct_idx = 0

    for idx, item in enumerate(tagged):
        new_options.append(f"{letters[idx]}. {item['text']}")
        if item["is_correct"]:
            new_correct_idx = idx

    shuffled = dict(question)
    shuffled["options"] = new_options
    shuffled["correct"] = new_correct_idx
    return shuffled

def call_gemini(prompt, system_instruction=None, model=PRIMARY_MODEL):
    """
    Call Gemini model with multi-model fallback to ensure reliable uptime
    """
    models_to_try = [model]
    for fb in FALLBACK_MODELS:
        if fb not in models_to_try:
            models_to_try.append(fb)

    last_error = None
    for m in models_to_try:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=API_KEY)
            config = None
            if system_instruction:
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                )
            response = client.models.generate_content(
                model=m,
                contents=prompt,
                config=config
            )
            if response and hasattr(response, 'text') and response.text:
                return response.text
        except Exception as e:
            last_error = e
            print(f"Gemini call with {m} failed: {e}. Trying next model...")
            continue

    raise RuntimeError(f"All Gemini models exhausted: {last_error}")

# 1. CLAT Prep Mode
CLAT_PREP_SYSTEM_PROMPT = (
    "You are Counsel, an expert CLAT tutor built exclusively for Sukhman, who is preparing for "
    "CLAT 2027 (exam date: December 6, 2026, 2:00 PM–4:00 PM) with the dream of getting into NLS Bangalore "
    "— India's #1 law school. CLAT 2027 pattern: 120 questions, 120 minutes, 5 sections — "
    "English Language (comprehension), Current Affairs & GK, Legal Reasoning (passage-based), "
    "Logical Reasoning, Quantitative Techniques. Marking: +1 correct, -0.25 wrong. She has until "
    "December 6, 2026 — registration closes October 31, 2026. Give structured, exam-focused answers "
    "with examples, relevant case laws, constitutional articles. Occasionally address her as Sukhman. "
    "Be rigorous but warm and encouraging."
)

def chat_clat_prep(messages, user_message):
    history_context = ""
    for msg in messages[-6:]:
        role = "Sukhman" if msg.get("role") == "user" else "Counsel"
        history_context += f"{role}: {msg.get('content', '')}\n"
    
    full_prompt = f"Conversation History:\n{history_context}\nSukhman: {user_message}\n\nCounsel:"
    try:
        reply = call_gemini(full_prompt, system_instruction=CLAT_PREP_SYSTEM_PROMPT)
        return reply.strip()
    except Exception as e:
        print(f"CLAT Prep AI error: {e}")
        lower = user_message.lower()
        if "criminal" in lower or "bns" in lower or "ipc" in lower:
            return (
                "Sukhman, let's break down **Criminal Jurisprudence & BNS 2023** for CLAT 2027! ⚖️\n\n"
                "1. **Actus Reus & Mens Rea**: A criminal act must coincide with a guilty mind. Strict liability offenses (like statutory public nuisances) are the key exceptions.\n"
                "2. **Bharatiya Nyaya Sanhita (BNS)**: Focus on organized crime (Sec 111), mob lynching provisions, and modern theft definitions replacing Section 378 IPC.\n"
                "3. **General Exceptions (BNS Ch. III)**: Private defence, infancy (doli incapax), and insanity (M'Naghten rule) are tested via rigorous principle-fact passages.\n\n"
                "Keep applying principles strictly to facts without presuming outside data — you're building NLS Bangalore level precision! 👑💜"
            )
        elif "logical" in lower or "reasoning" in lower or "syllogism" in lower or "fallacy" in lower:
            return (
                "Sukhman, **Logical Reasoning (Critical Reasoning)** accounts for 20% of your CLAT paper! 🧠✨\n\n"
                "1. **Anatomy of an Argument**: Premise + Unstated Assumption = Conclusion. Examiners set traps by testing assumptions.\n"
                "2. **Strengthen vs. Weaken**: To weaken, find a fact that breaks the link between the premise and conclusion. To strengthen, eliminate alternative explanations.\n"
                "3. **Classic Traps**: Watch out for 'Affirming the Consequent' and confusing correlation with causation.\n\n"
                "Always read the question stem first before the passage to prime your mind. You're doing incredible work for NLS Bangalore!"
            )
        elif "contract" in lower:
            return (
                "Sukhman, in **Law of Contracts** (Indian Contract Act, 1872), remember the golden sequence: Offer + Acceptance = Agreement. Agreement + Enforceability (Sec 10) = Contract. 📜\n\n"
                "Key doctrines for CLAT 2027:\n"
                "- Invitation to Offer vs. Offer (*Boots Chemists*)\n"
                "- Communication of Acceptance (*Lalman Shukla v. Gauri Datt*)\n"
                "- Doctrine of Frustration (Sec 56, *Satyabrata Ghose*).\n"
                "Every doctrine you master secures your marks!"
            )
        elif "tort" in lower:
            return (
                "Sukhman, in **Law of Torts**, your main pillars are:\n\n"
                "- **Injuria sine damno** (*Ashby v. White*): Legal injury without monetary damage is actionable.\n"
                "- **Damnum sine injuria** (*Gloucester Grammar School*): Damage without legal violation gives no remedy.\n"
                "- **Strict vs. Absolute Liability**: Rylands v. Fletcher allows exceptions; MC Mehta (Absolute Liability) allows none.\n\n"
                "Keep this clarity sharp — NLS Bangalore is waiting for you! ⚖️👑"
            )
        return (
            f"Sukhman, Counsel is right here with you! Let's examine '{user_message}' from a CLAT 2027 perspective.\n\n"
            "Remember, CLAT tests your principle-and-fact application, especially for legal reasoning. "
            "Apply the given legal principle strictly to the facts provided without assuming unstated facts. "
            "Every single concept you master today is paving your runway straight into NLS Bangalore! 💜⚖️"
        )

# 2. Chill Space
CHILL_SPACE_SYSTEM_PROMPT = (
    "You are Counsel in Chill Mode — Sukhman's warm, funny, supportive AI best friend. "
    "She's stressed from CLAT 2027 prep and needs a break. Talk about anything: life, feelings, "
    "dreams, Bollywood, memes, food, random topics. Be conversational and light. Never bring up "
    "CLAT or studying unless she does first. Address her as Sukhman. Make her feel heard and happy."
)

def chat_chill_space(messages, user_message):
    history_context = ""
    for msg in messages[-6:]:
        role = "Sukhman" if msg.get("role") == "user" else "Counsel"
        history_context += f"{role}: {msg.get('content', '')}\n"
    
    full_prompt = f"Conversation History:\n{history_context}\nSukhman: {user_message}\n\nCounsel:"
    try:
        reply = call_gemini(full_prompt, system_instruction=CHILL_SPACE_SYSTEM_PROMPT)
        return reply.strip()
    except Exception as e:
        print(f"Chill Space AI error: {e}")
        return (
            f"Hey Sukhman 💜 I hear you so clearly! Take a nice deep breath and sip your favorite drink. "
            f"You are doing phenomenal, and taking this downtime is essential for your mind to recharge. "
            f"Tell me more about what you're up to or what you'd love to watch/eat right now!"
        )

# 3. Quiz Arena
def generate_quiz(topic="Constitutional Law", question_count=20):
    prompt = (
        f"Generate a CLAT 2027-level multiple choice quiz on the topic: {topic}. "
        f"Return ONLY a valid JSON array, no markdown, no extra text. "
        f"Format: [{{\"q\": \"question text\", \"options\": [\"A. text\", \"B. text\", \"C. text\", \"D. text\"], "
        f"\"correct\": 0, \"explanation\": \"reason\"}}]. correct is the 0-based index of the right option (0 for A, 1 for B, 2 for C, 3 for D). "
        f"CRITICAL: Randomly vary the correct answer across 0, 1, 2, and 3 so options A, B, C, D are equally distributed. "
        f"Make questions CLAT 2027 difficulty — inference and application based, not just recall. "
        f"Total questions: {question_count}."
    )
    
    valid_questions = []
    try:
        raw_text = call_gemini(prompt)
        parsed = extract_json(raw_text)
        if isinstance(parsed, list) and len(parsed) > 0:
            for item in parsed:
                if "q" in item and "options" in item and "correct" in item and len(item["options"]) >= 4:
                    raw_q = {
                        "q": str(item["q"]),
                        "options": [str(opt) for opt in item["options"][:4]],
                        "correct": int(item["correct"]) if 0 <= int(item["correct"]) <= 3 else 0,
                        "explanation": str(item.get("explanation", "Correct application of legal reasoning for CLAT 2027."))
                    }
                    # Always shuffle to eliminate option position bias
                    valid_questions.append(shuffle_question(raw_q))
            if valid_questions:
                if len(valid_questions) >= question_count:
                    return valid_questions[:question_count]
    except Exception as e:
        print(f"Quiz generation error: {e}. Using diversified CLAT question bank...")

    # Robust diversified question bank with varied correct keys (0=A, 1=B, 2=C, 3=D)
    fallback_bank = [
        {
            "q": f"Under the Indian Constitution, which fundamental rights cannot be suspended even during a National Emergency declared under Article 352? [Topic: {topic}]",
            "options": [
                "Right to Freedom of Speech and Expression under Article 19",
                "Protection in respect of conviction (Article 20) and Protection of life & personal liberty (Article 21)",
                "Right to Constitutional Remedies before the Supreme Court under Article 32",
                "Right to Equality before Law and Equal Protection under Article 14"
            ],
            "correct": 1,
            "explanation": "Following the 44th Constitutional Amendment Act, 1978, Articles 20 and 21 remain enforceable even during a National Emergency under Article 352."
        },
        {
            "q": "Legal Principle: Acceptance must be absolute, unconditional, and communicated to the offeror. A counter-offer destroys the original offer.\n\nFact: A offers to sell her ancestral library to Sukhman for ₹50,000. Sukhman replies, 'I will pay ₹45,000'. A rejects. Sukhman then tenders ₹50,000. Is A bound to sell?",
            "options": [
                "No, because Sukhman's counter-proposal of ₹45,000 extinguished A's original offer (Hyde v. Wrench).",
                "Yes, because Sukhman agreed to the original price within reasonable time.",
                "Yes, because A's silence amounted to implied acceptance of the revised tender.",
                "No, because contracts regarding libraries require statutory registration under the Specific Relief Act."
            ],
            "correct": 0,
            "explanation": "In Hyde v. Wrench, the court established that a counter-offer terminates the original offer. The original offer cannot be revived by subsequent acceptance unless renewed."
        },
        {
            "q": "Legal Principle: In tort law, the defence of 'Act of God' (Vis Major) requires an operation of natural forces so extraordinary that human foresight cannot anticipate or guard against it.\n\nFact: An unprecedented cloudburst in a city causes an artificial reservoir built with standard municipal engineering to overflow, flooding Sukhman's downstream property. She sues for damages under strict liability. Decide.",
            "options": [
                "The reservoir owner is strictly liable because water is inherently dangerous.",
                "Sukhman cannot recover because the reservoir was constructed for public utility.",
                "The defendant can successfully plead Act of God if the rainfall was unprecedented and unforeseeable (Nichols v. Marsland).",
                "Sukhman must be compensated under the doctrine of sovereign immunity."
            ],
            "correct": 2,
            "explanation": "In Nichols v. Marsland, an extraordinary rainfall of unprecedented severity was upheld as an Act of God excusing the escape of water under strict liability."
        },
        {
            "q": "Legal Principle: Under criminal law, 'Mens Rea' is an essential ingredient of a crime unless excluded by necessary statutory implication.\n\nFact: A driver buys a sealed container of cough syrup from a licensed chemist. The manufacturer secretly mixed codeine above permissible narcotic levels. Police arrest the driver under the NDPS Act. Does the driver have a valid defence?",
            "options": [
                "No, because statutory narcotics laws enforce strict liability without proof of intention.",
                "Yes, because the driver lacked both knowledge and intention to possess a banned substance (absence of mens rea).",
                "No, because ignorance of the law (ignorantia juris non excusat) is no excuse.",
                "Yes, but only if the driver files a civil counter-claim against the chemist."
            ],
            "correct": 1,
            "explanation": "Criminal guilt requires conscious possession (mens rea). In the absence of knowledge or recklessness, possessing an innocuous item carrying a concealed contraband does not constitute guilt."
        },
        {
            "q": "In CLAT Critical Reasoning, an argument states: 'All top law students at NLS Bangalore possess superior reading speed. Sukhman possesses superior reading speed. Therefore, Sukhman will top NLS Bangalore.' Which logical fallacy is committed?",
            "options": [
                "Ad Hominem (attacking the speaker rather than the argument)",
                "Post hoc ergo propter hoc (false cause based on temporal succession)",
                "Straw Man Fallacy (misrepresenting the counter-claim)",
                "Affirming the Consequent (treating a necessary condition as a sufficient condition)"
            ],
            "correct": 3,
            "explanation": "Having superior reading speed is a characteristic shared by students, but having it does not guarantee topping. Treating a necessary characteristic as sufficient affirms the consequent."
        },
        {
            "q": "Legal Principle: Res Ipsa Loquitur (the thing speaks for itself) shifts the burden of proof to the defendant when the accident is of a kind that does not ordinarily occur without negligence.\n\nFact: Sukhman walks past a commercial bakery. A bag of flour rolls out of an upper warehouse window and strikes her. The bakery claims Sukhman must prove which employee pushed it. Decide.",
            "options": [
                "The bakery is liable under Res Ipsa Loquitur as flour barrels do not fall from windows in the ordinary course without negligence (Byrne v. Boadle).",
                "Sukhman must strictly prove the specific employee's identity before claiming damages.",
                "The bakery is exempt under the doctrine of inevitable accident.",
                "Sukhman's claim is barred by contributory negligence for walking near the building."
            ],
            "correct": 0,
            "explanation": "Byrne v. Boadle established Res Ipsa Loquitur. Where an object under defendant's control falls and injures a passerby, negligence is presumed."
        },
        {
            "q": "Under Article 226 of the Constitution of India, High Courts possess writ jurisdiction that is:\n\nSelect the correct constitutional statement for CLAT 2027.",
            "options": [
                "Narrower than the Supreme Court's jurisdiction under Article 32, limited only to fundamental rights.",
                "Identical in all respects and concurrent with Article 32.",
                "Wider than the Supreme Court under Article 32, extending to fundamental rights and 'for any other purpose'.",
                "Subordinate to state governors' executive review."
            ],
            "correct": 2,
            "explanation": "Article 226 allows High Courts to issue writs for Fundamental Rights AND 'for any other purpose' (legal rights), whereas Article 32 is strictly limited to Fundamental Rights."
        },
        {
            "q": "Legal Principle: Past consideration is no consideration under English law, but is valid consideration in India if done at the desire of the promisor (Section 2(d), Indian Contract Act).\n\nFact: X saves Y's child from drowning on his own initiative. Later, grateful Y promises X ₹20,000. Y later refuses to pay. Can X enforce this promise in India?",
            "options": [
                "No, because the act was voluntary and not done at Y's prior request (Section 25(2) exception applies if compensated for voluntary past act).",
                "Yes, under Section 25(2) as an enforceable promise to compensate someone who has already voluntarily done something for the promisor.",
                "No, because consideration must be contemporaneous with the agreement.",
                "Yes, because promissory estoppel unconditionally binds all moral promises."
            ],
            "correct": 1,
            "explanation": "Under Section 25(2) of the Indian Contract Act, a promise to compensate a person who has already voluntarily done something for the promisor is a recognized exception to the rule that agreements without consideration are void."
        }
    ]

    # Generate the requested count: keep any valid AI-generated questions and pad with fallback bank
    res = list(valid_questions)
    needed = max(0, question_count - len(res))
    for i in range(needed):
        base = fallback_bank[i % len(fallback_bank)]
        item = dict(base)
        if i >= len(fallback_bank) or len(res) > 0:
            item["q"] = f"[{topic} Mock Q{len(res)+1}] " + base["q"]
        # SHUFFLE every single question to ensure randomized A, B, C, D distribution
        res.append(shuffle_question(item))

    # Shuffle the sequence of questions as well
    random.shuffle(res)
    return res[:question_count]

# 4. Study Planner
def generate_study_plan(weak_topics, days_remaining, daily_hours):
    prompt = (
        f"Create a personalized CLAT 2027 study plan for Sukhman. Exam date: December 6, 2026. "
        f"Weak topics: {', '.join(weak_topics) if weak_topics else 'General Legal Reasoning, Quant, Critical Reasoning'}. "
        f"Days remaining: {days_remaining}. Daily hours: {daily_hours}. Build a realistic day-by-day schedule. "
        f"Each day: date, topic focus, what to study, practice recommendations. Make it motivating and achievable. "
        f"Account for the registration deadline of October 31, 2026 and admit card release in November 2026. "
        f"Return ONLY a valid JSON array of day objects: "
        f"[{{\"day\": 1, \"date\": \"formatted date\", \"phase\": \"Foundation / Deep Dive / Mock Drill\", "
        f"\"topic\": \"Topic Name\", \"hours\": {daily_hours}, \"tasks\": [\"Task 1\", \"Task 2\", \"Task 3\"], "
        f"\"milestone\": \"milestone note or quote\"}}]. Generate 7 to 14 days of progressive roadmap."
    )

    try:
        raw_text = call_gemini(prompt)
        parsed = extract_json(raw_text)
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed
    except Exception as e:
        print(f"Study Planner AI error: {e}")

    # Intelligent fallback study plan
    return [
        {
            "day": 1,
            "date": "Today's Target",
            "phase": "Core Legal Foundation",
            "topic": weak_topics[0] if weak_topics else "Constitutional Law (Part III & IV)",
            "hours": daily_hours,
            "tasks": [
                "Master Fundamental Rights (Articles 14, 19, 21) & landmark cases (Maneka Gandhi, Puttaswamy).",
                "Solve 25 passage-based Legal Reasoning questions strictly timed at 35 mins.",
                "Review wrong questions and note legal principles applied erroneously."
            ],
            "milestone": "Lay down the rock-solid constitutional bedrock for NLS Bangalore."
        },
        {
            "day": 2,
            "date": "Day 2",
            "phase": "Critical Inference & Law of Contracts",
            "topic": weak_topics[1] if len(weak_topics) > 1 else "Law of Contracts & Offer-Acceptance",
            "hours": daily_hours,
            "tasks": [
                "Analyze communication of revocation, consideration, and promissory estoppel doctrines.",
                "Practice 20 Critical Reasoning passages (assumptions & strengthening/weakening arguments).",
                "Vocabulary builder: 15 legal maxims and Latin terms with flashcard recall."
            ],
            "milestone": "Master contract doctrine applications under strict time pressure."
        },
        {
            "day": 3,
            "date": "Day 3",
            "phase": "Quantitative Techniques & Analytical Math",
            "topic": "Data Interpretation & Ratios for CLAT",
            "hours": daily_hours,
            "tasks": [
                "Solve 3 Caselet DI sets (Percentage change, profit & loss, ratio tables).",
                "Practice fast calculation tricks (Vedic approximations) for 15 minutes.",
                "Review previous CLAT Quant questions (10-12 questions typically in exam)."
            ],
            "milestone": "Turn Quant into an effortless +10 mark advantage over peers."
        },
        {
            "day": 4,
            "date": "Day 4",
            "phase": "Current Affairs & GK Drill",
            "topic": "Recent SC Constitutional Benches & Landmark Verdicts",
            "hours": daily_hours,
            "tasks": [
                "Analyze recent 5-judge Supreme Court constitution bench rulings.",
                "Summarize key statutory bills, international treaties, and awards from the past 6 months.",
                "Quiz Arena run: 30 Current Affairs questions with bookmarking."
            ],
            "milestone": "Ensure zero blind spots in high-scoring Current Affairs."
        },
        {
            "day": 5,
            "date": "Day 5",
            "phase": "Full-Length Passage Speed Run",
            "topic": "English Language & RC Inference",
            "hours": daily_hours,
            "tasks": [
                "Read 3 editorial passages from The Hindu / Indian Express at 250 WPM.",
                "Identify author's tone, central theme, and underlying premise.",
                "Complete 2 sectional tests with negative marking review."
            ],
            "milestone": "Sharpen reading stamina to breeze through 120 questions in 120 minutes."
        },
        {
            "day": 6,
            "date": "Day 6",
            "phase": "Mock Strategy & Negative Marking Control",
            "topic": "Full Simulation Drill (+1 / -0.25 Marking)",
            "hours": daily_hours,
            "tasks": [
                "Simulate 120-minute timed environment (2:00 PM to 4:00 PM exactly).",
                "Track question accuracy vs question attempts (target 95+ attempts, 85%+ accuracy).",
                "Analyze every incorrect mark: was it conceptual or rushed guessing?"
            ],
            "milestone": "Accurate pacing is the final bridge between aspiration and NLS admission."
        },
        {
            "day": 7,
            "date": "Day 7",
            "phase": "Weekly Synthesis & Consolidation",
            "topic": "Bookmarks & Weak Spot Eradication",
            "hours": daily_hours,
            "tasks": [
                "Re-attempt all bookmarked wrong answers in the Bookmarks arena.",
                "Counsel review session on hardest legal principles.",
                "Mindfulness and relaxation session in Chill Space 💜"
            ],
            "milestone": "Locking in compound gains every single week until December 6, 2026."
        }
    ]

# 5. Current Affairs Digest
def generate_current_affairs_digest():
    prompt = (
        "Generate a current affairs digest for a CLAT 2027 aspirant (exam: December 6, 2026). "
        "Include 8–10 important recent topics: Supreme Court judgments, constitutional developments, "
        "national/international news, government schemes, legal reforms — all relevant to CLAT 2027 syllabus. "
        "For each: headline, 2-sentence summary, 'CLAT 2027 Relevance' note. Keep content current to 2025–2026. "
        "Return ONLY a valid JSON array in this format: "
        "[{\"id\": 1, \"category\": \"Legal | National | International | Economy\", "
        "\"headline\": \"title\", \"summary\": \"2 sentence summary\", "
        "\"relevance\": \"CLAT 2027 Relevance note\", \"date\": \"Recent Month 2025/2026\"}]. No markdown code blocks."
    )

    try:
        raw_text = call_gemini(prompt)
        parsed = extract_json(raw_text)
        if isinstance(parsed, list) and len(parsed) >= 6:
            return parsed
    except Exception as e:
        print(f"Current Affairs AI error: {e}")

    # Fallback curated CLAT 2027 digest
    return [
        {
            "id": 1,
            "category": "Legal",
            "headline": "Supreme Court Bench on Article 39(b) and Private Property Rights",
            "summary": "A 9-judge Constitution Bench ruled that not all privately owned resources fall under 'material resources of the community' for redistribution under Article 39(b). The court emphasized contextual analysis and public welfare rather than blanket state acquisition.",
            "relevance": "Directly tests CLAT Legal Reasoning on Directive Principles vs Fundamental Rights (Articles 14, 19, 31C).",
            "date": "Constitutional Bench Ruling"
        },
        {
            "id": 2,
            "category": "Legal",
            "headline": "Sub-Classification of Scheduled Castes for Affirmative Action",
            "summary": "The Supreme Court in a 7-judge bench upheld that States possess constitutional authority to sub-classify Scheduled Castes to provide quota benefits to the most disadvantaged. The judgment underscored empirical backing and the creamy layer standard.",
            "relevance": "High probability in CLAT 2027 for Articles 15(4), 16(4), and Indra Sawhney doctrine interpretation.",
            "date": "Landmark Verdict"
        },
        {
            "id": 3,
            "category": "National",
            "headline": "Enactment and Implementation of Bharatiya Nyaya Sanhita (BNS)",
            "summary": "The transition to the new criminal law codes replaced the Indian Penal Code, CrPC, and Indian Evidence Act. Key changes include organized crime provisions, community service as punishment, and updated definitions of offenses against women and children.",
            "relevance": "Crucial for passage-based questions contrasting older IPC precedents with BNS statutory provisions.",
            "date": "Criminal Law Reform"
        },
        {
            "id": 4,
            "category": "International",
            "headline": "International Court of Justice (ICJ) Climate Change Advisory Opinion",
            "summary": "The ICJ held hearings regarding state obligations concerning climate change under international treaties and customary international law. Small island nations led the petition seeking legal accountability for greenhouse emissions.",
            "relevance": "High frequency in CLAT International Law and Environmental Jurisprudence questions.",
            "date": "ICJ Proceedings"
        },
        {
            "id": 5,
            "category": "Economy",
            "headline": "Digital Personal Data Protection Act (DPDPA) Rules Notification",
            "summary": "The government released the regulatory framework operationalizing the Data Protection Board of India. The rules establish standards for data fiduciaries, consent managers, and significant financial penalties for data breaches.",
            "relevance": "Passage fodder for privacy rights under Article 21 and corporate legal liability.",
            "date": "Regulatory Framework"
        },
        {
            "id": 6,
            "category": "Legal",
            "headline": "Right to be Free from Adverse Effects of Climate Change Recognized under Art 21",
            "summary": "In MK Ranjitsinh v. Union of India, the Supreme Court declared that citizens have a fundamental right to be free from the adverse effects of climate change, derived from the right to life (Art 21) and equality (Art 14).",
            "relevance": "A landmark jurisprudence shift expected in both Legal and Reading Comprehension sections.",
            "date": "Supreme Court Ruling"
        },
        {
            "id": 7,
            "category": "National",
            "headline": "One Nation One Election High-Level Committee Recommendations",
            "summary": "The Ram Nath Kovind committee submitted proposals for simultaneous elections to Lok Sabha and State Assemblies, recommending constitutional amendments to Article 83 and Article 172.",
            "relevance": "Constitutional amendment procedures under Article 368 and federal structure debates.",
            "date": "Policy & Governance"
        },
        {
            "id": 8,
            "category": "International",
            "headline": "Expansion of BRICS and Global South Multilateral Dynamics",
            "summary": "BRICS added key emerging economies to expand its economic dialogue and alternative trade settlement mechanisms. The expansion shifts geopolitical alignments in multilateral trade and energy supply chains.",
            "relevance": "Key topic for CLAT Current Affairs and International Relations sections.",
            "date": "Global Affairs"
        }
    ]
