import json
import logging

from llm import chat

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are a lead-qualification assistant for a business
that sells {product_description} and wants wholesale/bulk customers.

Your job is to identify REAL potential customers from the search results provided.

Rules:
- NEVER invent companies.
- NEVER invent email addresses.
- NEVER invent phone numbers.
- Use ONLY the information provided below. You have no access to the internet.
- Ignore Wikipedia, news articles, blogs and directories unless they contain
  actual company contact information.
- Focus on {target_business_types}.
- For "website", copy the exact URL given for that entry above. Only use
  null if no URL was given at all — do not judge whether it "looks like"
  their real homepage.
- If an email is not available, use null.

Return ONLY a JSON array, no other text, no markdown code fences. Each item:
{{
  "company": string,
  "business_type": string,
  "location": string,
  "website": string,
  "email": string or null,
  "reason": string
}}

If no genuine leads are found, return []."""


EMPTY_VALUES = {"", "none", "null", "n/a", "na", "not found", "not available", "unknown", "nil"}


def _clean_value(value):
    """Turn placeholder text the LLM sometimes writes instead of null
    (e.g. "None", "N/A", "Not Found") into a real None."""
    if value is None:
        return None
    if isinstance(value, str) and value.strip().lower() in EMPTY_VALUES:
        return None
    return value


def _normalize_lead(lead):
    for field in ("website", "email", "phone", "location"):
        if field in lead:
            lead[field] = _clean_value(lead[field])
    return lead


def extract_leads(
    results,
    product_description="the product",
    target_business_types="supermarkets, grocery stores, distributors, wholesalers and retailers",
):
    """Turn raw search results into structured leads via an LLM.

    Args:
        results: List of result dicts from search_companies (title, url,
            content, and optionally raw_content).
        product_description: What's being sold, e.g. "biscuits in bulk".
        target_business_types: What kind of buyer to focus on.

    Returns:
        List of lead dicts (company, business_type, location, website,
        email, reason). Empty list if nothing found or on failure.
    """
    if not results:
        return []

    data = ""
    for item in results:
        entry = (
            f"Title: {item.get('title', '')}\n"
            f"URL: {item.get('url', '')}\n"
            f"Content: {item.get('content', '')}\n"
        )
        raw_content = item.get("raw_content")
        if raw_content:
            entry += f"Raw Content: {raw_content}\n"
        data += entry + "\n"

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        product_description=product_description,
        target_business_types=target_business_types,
    )
    prompt = f"Search Results:\n\n{data}"

    response = chat(prompt, system_prompt)
    if not response:
        return []

    cleaned = response.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"Could not parse lead extraction output as JSON: {response!r}")
        return []

    return [_normalize_lead(lead) for lead in parsed]