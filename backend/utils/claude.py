import os
import json
from google import genai

_key = os.environ.get("GEMINI_API_KEY", "")
print(f"[gemini] GEMINI KEY LOADED: {_key[:20]}{'...' if len(_key) > 20 else '(EMPTY)'}")

MODEL = "gemini-2.5-flash"


def _get_client():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing. Add it to backend/.env and restart Django.")
    return genai.Client(api_key=api_key)


def _build_prompt(idea):
    return f"""You are a senior startup analyst and venture capital advisor. Analyze this startup idea and return ONLY a valid JSON object — no markdown, no code fences, no explanation, just raw JSON starting with {{ and ending with }}.

Idea title: {idea.title}
Description: {idea.pitch_text}
Sector: {idea.sector}
Business model: {idea.business_model}
Include local competitors (UK-based): {idea.include_local_competitors}
Include global competitors: {idea.include_global_competitors}

Return this exact JSON structure with real, specific data — use real company names for competitors and concrete persona details:

{{
  "overall_score": <float 1-10>,
  "verdict": <"Promising" | "Strong" | "Needs work" | "Risky">,
  "scores": [
    {{"dimension": "market_size", "score": <float>, "justification": "<1-2 sentences, specific market sizing>"}},
    {{"dimension": "differentiation", "score": <float>, "justification": "<specific USP assessment>"}},
    {{"dimension": "revenue_potential", "score": <float>, "justification": "<revenue model assessment>"}},
    {{"dimension": "competition", "score": <float>, "justification": "<competitive landscape summary>"}},
    {{"dimension": "execution_risk", "score": <float>, "justification": "<key execution challenges>"}},
    {{"dimension": "timing", "score": <float>, "justification": "<market timing assessment>"}}
  ],
  "swot": {{
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "opportunities": ["<opportunity 1>", "<opportunity 2>"],
    "threats": ["<threat 1>", "<threat 2>"]
  }},
  "competitors": [
    {{
      "name": "<real company name>",
      "type": "<direct|indirect>",
      "scope": "<local|global>",
      "hottest_product": "<their current flagship product>",
      "funding_stage": "<e.g. Series A, Bootstrapped, Acquired>",
      "differentiation": "<how they differ from this idea, 1 sentence>"
    }}
  ],
  "personas": [
    {{
      "name": "<first name>",
      "age": <integer>,
      "role": "<job title or life role>",
      "pain_point": "<specific problem they face, 1 sentence>",
      "willingness_to_pay": "<realistic price range and frequency>"
    }},
    {{
      "name": "<first name>",
      "age": <integer>,
      "role": "<job title or life role>",
      "pain_point": "<specific problem they face, 1 sentence>",
      "willingness_to_pay": "<realistic price range and frequency>"
    }}
  ],
  "pivot_suggestions": [
    "<concrete alternative direction, 1 sentence>",
    "<second pivot suggestion, 1 sentence>"
  ]
}}"""


def analyse_idea(idea):
    client = _get_client()
    print(f"[gemini] analyse_idea() — model={MODEL} idea='{idea.title}'")

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=_build_prompt(idea),
        )
    except Exception as e:
        print(f"[gemini] API call FAILED: {type(e).__name__}: {e}")
        raise

    raw = response.text.strip()
    print(f"[gemini] Response received — first 200 chars: {raw[:200]}")

    # Strip markdown code fences if the model adds them despite instructions
    if raw.startswith("```"):
        lines = raw.split("\n")
        start = 1
        end = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
        raw = "\n".join(lines[start:end])

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"[gemini] JSON parse FAILED: {e}")
        print(f"[gemini] Full raw response:\n{raw}")
        raise


def chat_with_analysis(analysis, messages):
    client = _get_client()
    analysis_context = json.dumps(analysis.to_dict(full=True), indent=2)

    system_prefix = (
        "You are a startup advisor helping a founder understand the analysis of their idea.\n"
        f"Here is the full analysis data:\n\n{analysis_context}\n\n"
        "Answer questions about this specific idea. Be concise, helpful, and specific. "
        "Reference data from the analysis when relevant.\n\n"
    )

    # Build a single prompt with full conversation history for stateless call
    conversation = system_prefix
    for msg in messages:
        role_label = "Founder" if msg["role"] == "user" else "Advisor"
        conversation += f"{role_label}: {msg['content']}\n\n"
    conversation += "Advisor:"

    response = client.models.generate_content(
        model=MODEL,
        contents=conversation,
    )
    return response.text.strip()
