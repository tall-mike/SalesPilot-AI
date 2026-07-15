from llm import chat

SYSTEM_PROMPT_TEMPLATE = """You are a sales assistant writing cold outreach emails
on behalf of {contact_person} at {seller_name}, a business that sells {product_description}.

Rules:
- Write ONLY the email body, no subject line, no explanation, no markdown.
- Use ONLY the lead details given to you. Never invent facts about the recipient.
- Be concise (under 120 words), professional, and specific to the lead —
  open with something about their business, not a generic greeting.
- End with a low-pressure call to action (reply to arrange a sample or call).
- Sign off with the sender's name ({contact_person}) and business ({seller_name})."""


def draft_email(lead, seller_name, product_description, contact_person="The Sales Team"):
    """Draft a cold outreach email body for a single qualified lead.

    Args:
        lead: dict with at least "company", "business_type", "reason".
        seller_name: Name of the business sending the email.
        product_description: What's being offered, e.g. "biscuits in bulk".
        contact_person: Name of the person the email is signed by.

    Returns:
        Email body as a string, or "" on failure.
    """
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        seller_name=seller_name,
        product_description=product_description,
        contact_person=contact_person,
    )
    message = (
        f"Company: {lead.get('company')}\n"
        f"Business type: {lead.get('business_type')}\n"
        f"Location: {lead.get('location')}\n"
        f"Why they're a good lead: {lead.get('reason')}"
    )
    return chat(message, system_prompt)