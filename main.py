import logging

from search import search_companies, enrich_leads
from lead_extractor import extract_leads
from email_drafter import draft_email
from export import save_leads

logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")

SELLER_NAME = "Sweet Mouth Bakery"
CONTACT_PERSON = "Okafor John"
PRODUCT_DESCRIPTION = "biscuits in bulk"

app = None


def run_search(user_request):
    """One full round: search -> qualify -> enrich with email/phone."""
    print("\nSearching online...")
    results = search_companies(user_request, max_results=10)

    if not results:
        print("No results came back for that. Try a different search.")
        return []

    leads = extract_leads(
        results,
        product_description=PRODUCT_DESCRIPTION,
        target_business_types=user_request,
    )
    if not leads:
        print("Found pages, but none looked like real qualifying companies.")
        return []

    leads = enrich_leads(leads)
    return leads


def show_leads(leads):
    print(f"\nFound {len(leads)} lead(s):\n")
    for i, lead in enumerate(leads, start=1):
        print(f"{i}. {lead.get('company')} — {lead.get('business_type')} ({lead.get('location')})")
        print(f"   Website: {lead.get('website') or 'Not Found'}")
        print(f"   Email:   {lead.get('email') or 'Not Found'}")
        print(f"   Phone:   {lead.get('phone') or 'Not Found'}")
        print(f"   Why:     {lead.get('reason')}")


def main():
    print("Hi, I'm SalesPilot AI. I can help you find new wholesale customers online.")

    while True:
        user_request = input(
            "\nWhat would you like to search for? "
            "(e.g. 'supermarkets in Port Harcourt', or 'quit' to exit)\n> "
        ).strip()

        if user_request.lower() in ("quit", "exit"):
            print("Okay, goodbye!")
            break

        leads = run_search(user_request)
        if not leads:
            continue

        show_leads(leads)

        leads_with_email = [lead for lead in leads if lead.get("email")]
        leads_without_email = [lead for lead in leads if not lead.get("email")]

        if leads_with_email:
            answer = input(
                f"\n{len(leads_with_email)} lead(s) have an email. "
                "Should I draft cold emails for them? (yes/no)\n> "
            ).strip().lower()
            if answer.startswith("y"):
                print("\nDrafting emails...")
                for lead in leads_with_email:
                    lead["email_draft"] = draft_email(lead, SELLER_NAME, PRODUCT_DESCRIPTION, CONTACT_PERSON)
                print("Done. Drafts are included in what gets saved.")

        if leads_without_email:
            print(
                f"\n{len(leads_without_email)} lead(s) had no email — "
                "these are numbers/sites I found instead, worth a manual follow-up:"
            )
            for lead in leads_without_email:
                print(f"  - {lead.get('company')}: {lead.get('phone') or lead.get('website') or 'no contact info found'}")

        saved_count = save_leads(leads)
        if saved_count:
            print(f"\nSaved {saved_count} new lead(s) to leads.txt")
        else:
            print("\nNo new leads to save (already in leads.txt from a previous search).")


if __name__ == "__main__":
    main()