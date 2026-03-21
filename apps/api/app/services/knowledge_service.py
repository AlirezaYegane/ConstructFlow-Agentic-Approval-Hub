from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_DIR = Path(__file__).resolve().parents[1]  # apps/api/app
load_dotenv(BASE_DIR.parent / ".env")           # apps/api/.env

DEFAULT_POLICY_DIR = BASE_DIR / "knowledge" / "policies"
DEFAULT_CHROMA_DIR = BASE_DIR.parent / "storage" / "chroma"


def get_policy_dir() -> Path:
    raw = Path(os.getenv("POLICY_DOCS_DIR", str(DEFAULT_POLICY_DIR)))
    return raw if raw.is_absolute() else (BASE_DIR / raw).resolve()


def get_chroma_dir() -> str:
    raw = Path(os.getenv("CHROMA_PERSIST_DIR", str(DEFAULT_CHROMA_DIR)))
    resolved = raw if raw.is_absolute() else (BASE_DIR.parent / raw).resolve()
    return str(resolved)


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    model = os.getenv("GOOGLE_EMBEDDING_MODEL", "models/text-embedding-004")
    return GoogleGenerativeAIEmbeddings(model=model)


def get_vectorstore(collection_name: str = "constructflow_policies") -> Chroma:
    return Chroma(
        collection_name=collection_name,
        embedding_function=get_embeddings(),
        persist_directory=get_chroma_dir(),
    )


def load_policy_documents() -> list[dict[str, Any]]:
    policy_dir = get_policy_dir()
    docs: list[dict[str, Any]] = []

    if not policy_dir.exists():
        return docs

    for path in policy_dir.glob("*.md"):
        text = path.read_text(encoding="utf-8-sig")
        docs.append(
            {
                "doc_id": path.stem,
                "title": path.stem.replace("_", " ").title(),
                "source_path": str(path),
                "text": text,
            }
        )
    return docs


def build_policy_index() -> dict[str, Any]:
    raw_docs = load_policy_documents()
    if not raw_docs:
        return {"indexed_documents": 0, "indexed_chunks": 0}

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=100,
    )

    texts: list[str] = []
    metadatas: list[dict[str, Any]] = []
    ids: list[str] = []

    for doc in raw_docs:
        chunks = splitter.split_text(doc["text"])
        for idx, chunk in enumerate(chunks):
            chunk_id = f'{doc["doc_id"]}::chunk::{idx}'
            texts.append(chunk)
            metadatas.append(
                {
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "chunk_index": idx,
                    "source_path": doc["source_path"],
                }
            )
            ids.append(chunk_id)

    vectorstore = get_vectorstore()
    try:
        vectorstore.delete_collection()
    except Exception:
        pass

    vectorstore = get_vectorstore()
    vectorstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)

    return {
        "indexed_documents": len(raw_docs),
        "indexed_chunks": len(texts),
    }


def retrieve_policy_chunks(query: str, k: int = 4) -> list[dict[str, Any]]:
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=k)

    items: list[dict[str, Any]] = []
    for doc, score in results:
        items.append(
            {
                "text": doc.page_content,
                "score": float(score),
                "doc_id": doc.metadata.get("doc_id"),
                "title": doc.metadata.get("title"),
                "chunk_index": doc.metadata.get("chunk_index"),
                "source_path": doc.metadata.get("source_path"),
            }
        )
    return items

def format_policy_context(query: str, k: int = 4) -> str:
    items = retrieve_policy_chunks(query=query, k=k)
    if not items:
        return "No policy context found."

    blocks: list[str] = []
    for idx, item in enumerate(items, start=1):
        title = item.get("title") or item.get("doc_id") or f"Policy {idx}"
        body = item.get("text", "").strip()
        blocks.append(f"[Policy {idx}: {title}]\n{body}")

    return "\n\n".join(blocks)

