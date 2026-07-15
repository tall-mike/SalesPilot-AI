import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from lead_extractor import extract_leads
from search import enrich_leads, search_companies

PRODUCT_DESCRIPTION = "biscuits in bulk"


def run_search(user_request, max_results=8):
    results = search_companies(user_request, max_results=max_results)
    if not results:
        return []

    leads = extract_leads(
        results,
        product_description=PRODUCT_DESCRIPTION,
        target_business_types=user_request,
    )
    if not leads:
        return []

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
    return normalized


class SearchHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json(200, {"status": "ok"})
            return

        if parsed.path == "/api/search":
            query = parse_qs(parsed.query).get("query", [""])[0].strip()
            if not query:
                self._send_json(400, {"error": "Missing query parameter"})
                return

            results = run_search(query, max_results=8)
            self._send_json(200, {"results": results, "query": query})
            return

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/api/search":
            self._send_json(404, {"error": "Not found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(body or "{}")
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        query = (payload.get("query") or "").strip()
        max_results = int(payload.get("max_results", 8) or 8)
        if not query:
            self._send_json(400, {"error": "Missing query"})
            return

        results = run_search(query, max_results=max_results)
        self._send_json(200, {"results": results, "query": query})

    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), SearchHandler)
    print("SalesPilot AI backend listening on http://127.0.0.1:8000")
    server.serve_forever()
