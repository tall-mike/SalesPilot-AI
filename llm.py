import logging

import ollama

logger = logging.getLogger(__name__)


def chat(message, system_prompt, model="llama3.2"):
    """Send a single-turn chat request to a local Ollama model.

    system_prompt is a required argument (no default). This is deliberate:
    the model has no search tool, so a prompt that tells it to "search the
    web" will make it hallucinate a fake session instead of failing. Every
    caller must supply a prompt scoped to what the model can actually do
    with the data it's given (extract, draft, summarize — not search).

    Returns:
        The model's reply as a string, or "" on failure.
    """
    try:
        response = ollama.chat(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
        )
    except Exception as e:
        logger.error(f"LLM chat call failed: {e}")
        return ""

    return response["message"]["content"]