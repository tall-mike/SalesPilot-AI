import os
from datetime import datetime

DEFAULT_FILEPATH = "contact.txt"


def _already_saved(filepath):
    """Company names already present in the file, so we don't re-save them."""
    if not os.path.exists(filepath):
        return set()

    seen = set()
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("Company: "):
                seen.add(line.removeprefix("Company: ").strip())
    return seen


def save_leads(leads, filepath=DEFAULT_FILEPATH):
    """
    Append new leads to a text file, skipping any company already saved
    from a previous run. Returns the number of new leads written.
    """
    already_saved = _already_saved(filepath)
    new_leads = [lead for lead in leads if lead.get("company") not in already_saved]

    if not new_leads:
        return 0

    with open(filepath, "a", encoding="utf-8") as f:
        f.write(f"\n=== Saved {datetime.now().strftime('%Y-%m-%d %H:%M')} ===\n")
        for lead in new_leads:
            f.write(f"Company: {lead.get('company')}\n")
            f.write(f"Business Type: {lead.get('business_type')}\n")
            f.write(f"Location: {lead.get('location')}\n")
            f.write(f"Website: {lead.get('website')}\n")
            f.write(f"Email: {lead.get('email') or 'Not Found'}\n")
            f.write(f"Contact: {lead.get('phone') or 'Not Found'}\n")
            f.write(f"Reason: {lead.get('reason')}\n")
            if lead.get("email_draft"):
                f.write(f"Drafted Email:\n{lead['email_draft']}\n")
            f.write("---\n")

    return len(new_leads)