import logging
import os
import re

from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()
logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(?:\+?234|0)[-.\s]?[7-9][0-1][-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{3,4}")

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

DEFAULT_EXCLUDED_DOMAINS = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "jiji.ng",
    "wikipedia.org",
    "linkedin.com",
]


def search_companies(query, max_results=10, search_depth="basic", exclude_domains=None):
    """Search the web for companies matching a query.

    Args:
        query: Search terms, e.g. "supermarkets Port Harcourt bulk food supplier".
        max_results: Number of results to return.
        search_depth: "basic" (1 credit) or "advanced" (2 credits, deeper content).
        exclude_domains: Domains to skip. Defaults to social/directory sites
            that rarely list a contact email.

    Returns:
        List of result dicts (title, url, content, score). Empty list on failure.
    """
    try:
        response = tavily.search(
            query=query,
            topic="general",
            search_depth=search_depth,
            max_results=max_results,
            exclude_domains=exclude_domains or DEFAULT_EXCLUDED_DOMAINS,
        )
    except Exception as e:
        logger.error(f"Search failed for {query!r}: {e}")
        return []

    return response.get("results", [])


def enrich_leads(leads):
    """
    For qualified leads that have a website, fetch the real page content
    (one batched Tavily extract call) and regex-search it for a contact
    email and/or Nigerian phone number. Mutates and returns the same list.

    Only called on already-qualified leads, not raw search results — so
    credits are spent enriching companies worth contacting, not every hit.
    Phone matching is best-effort regex, not a verified/validated number —
    always worth a human glance before dialing or texting.
    """
    urls = [lead["website"] for lead in leads if lead.get("website") and (not lead.get("email") or not lead.get("phone"))]
    if not urls:
        return leads

    try:
        response = tavily.extract(urls=urls, extract_depth="advanced")
    except Exception as e:
        logger.warning(f"Batch extract failed for {len(urls)} url(s): {e}")
        return leads

    content_by_url = {
        page.get("url"): page.get("raw_content") for page in response.get("results", [])
    }

    for lead in leads:
        url = lead.get("website")
        content = content_by_url.get(url) if url else None
        if not content:
            continue
        if not lead.get("email"):
            match = EMAIL_REGEX.search(content)
            if match:
                lead["email"] = match.group(0)
        if not lead.get("phone"):
            match = PHONE_REGEX.search(content)
            if match:
                lead["phone"] = match.group(0)

    return leads