import os
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from search import search_companies, enrich_leads
from lead_extractor import extract_leads

app = FastAPI(title="SalesPilot AI")

SELLER_NAME = "Sweet Mouth Bakery"
CONTACT_PERSON = "Okafor John"
PRODUCT_DESCRIPTION = "biscuits in bulk"


@app.get("/")
def root():
    return HTMLResponse(
        """
        <html>
          <head><title>SalesPilot AI</title></head>
          <body style='font-family: Arial, sans-serif; padding: 2rem; background:#f8fbff;'>
            <h1>SalesPilot AI API</h1>
            <p>This is the backend for SalesPilot AI.</p>
            <p>Use <code>/health</code> for health checks and <code>/search</code> for lead searches.</p>
          </body>
        </html>
        """
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search")
def search_leads(payload: dict):
    query = (payload.get("query") or "").strip()
    if not query:
        return JSONResponse(status_code=400, content={"error": "Missing query"})

    results = search_companies(query, max_results=8)
    if not results:
        return {"results": [], "query": query}

    leads = extract_leads(
        results,
        product_description=PRODUCT_DESCRIPTION,
        target_business_types=query,
    )
    if not leads:
        return {"results": [], "query": query}

    enriched = enrich_leads(leads)
    normalized = []
    for index, lead in enumerate(enriched, start=1):
        normalized.append(
            {
                "id": index,
                "companyName": lead.get("company") or "Unknown company",
                "businessType": lead.get("business_type") or "Business",
                "website": lead.get("website") or "",
                "email": lead.get("email") or "",
                "phone": lead.get("phone") or "",
                "location": lead.get("location") or "",
                "leadScore": max(70, 95 - index),
                "reason": lead.get("reason") or "Potential fit based on the online profile.",
            }
        )
    return {"results": normalized, "query": query}
