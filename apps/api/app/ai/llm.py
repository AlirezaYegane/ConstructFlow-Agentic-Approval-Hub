import os
from langchain_google_genai import ChatGoogleGenerativeAI


def get_chat_model() -> ChatGoogleGenerativeAI:
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=0,
    )