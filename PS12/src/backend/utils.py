import fitz  # PyMuPDF
import os
import re
import logging
import numpy as np

_logger = logging.getLogger(__name__)


def extract_text_from_file(path: str) -> str:
    """
    Extract text from a .pdf or .txt file path. Returns a single string.
    """
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(path)
    elif ext == ".txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    else:
        return ""


def extract_text_from_pdf(path: str) -> str:
    """
    Use PyMuPDF (fitz) to extract text from each page.
    """
    text_parts = []
    try:
        doc = fitz.open(path)
        for page in doc:
            text = page.get_text("text")
            if text:
                text_parts.append(text)
        doc.close()
    except Exception as e:
        # Log the exception then re-raise so the caller can return a 500 and we keep useful traces
        import logging
        logging.exception("PDF extraction failed for %s", path)
        raise

    return "\n".join(text_parts)


def clean_text(text: str) -> str:
    """
    Basic cleaning to remove repeated headers/footers and fix line breaks.
    This is heuristic-based and intentionally conservative.
    """
    if not text:
        return ""

    # Normalize line endings
    t = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove multiple consecutive short lines that look like page numbers or headers
    lines = [ln.strip() for ln in t.split("\n")]

    cleaned_lines = []
    for ln in lines:
        # drop pure page-number lines
        if re.fullmatch(r"\d{1,4}", ln):
            continue
        # drop header/footer like 'Chapter 1' repeated very frequently heuristic: very short and alphanumeric
        if len(ln) <= 3 and re.match(r"^[A-Za-z0-9]{1,3}$", ln):
            continue
        cleaned_lines.append(ln)

    # Join lines but preserve paragraph breaks: if a line ends with a hyphen, join without space
    out_parts = []
    for ln in cleaned_lines:
        if not out_parts:
            out_parts.append(ln)
            continue
        prev = out_parts[-1]
        if prev.endswith("-"):
            out_parts[-1] = prev[:-1] + ln
        elif ln == "":
            out_parts.append(ln)
        elif ln and ln[0].islower():
            # continuation line — join with space
            out_parts[-1] = prev + " " + ln
        else:
            out_parts.append(ln)

    cleaned = "\n\n".join([p for p in out_parts if p.strip() != ""])

    # Collapse multiple spaces
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    return cleaned.strip()


def summarize_text(text: str, max_chars: int = 2000, model_min_len: int = 25, model_max_len: int | None = None, target_ratio: float = 0.6) -> str:
    """
    Hierarchical summarization with a preference for a local transformers
    summarizer (distilbart). Falls back to a spaCy extractive summarizer and
    finally a simple heuristic.

    The function attempts to summarize long texts by chunking them,
    summarizing each chunk, then recursively compressing the combined
    chunk-summaries until the result fits within `max_chars`.
    """
    if not text:
        return ""

    # Attempt transformers-based abstractive summarization first
    try:
        from transformers import pipeline

        _summ = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

        max_chunk_size = 1000
        chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]

        summarized_chunks = []
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue
            # For very short chunks, skip heavy summarization
            if len(chunk) < 40:
                summarized_chunks.append(chunk)
                continue

            computed = int(max(5, len(chunk) * float(target_ratio)))
            if computed >= len(chunk):
                computed = max(len(chunk) - 1, 1)

            cap = 150
            chosen_max = model_max_len if model_max_len is not None else min(computed, cap)
            chosen_min = max(5, int(chosen_max * 0.6))
            if chosen_min >= chosen_max:
                chosen_min = max(1, chosen_max - 1)

            out = _summ(chunk, max_length=chosen_max, min_length=chosen_min, do_sample=False)
            if out and isinstance(out, list):
                summarized_chunks.append(out[0].get("summary_text", "").strip())

        combined = " ".join([s for s in summarized_chunks if s]).strip()
        if not combined:
            raise RuntimeError("Transformers summarizer returned empty summary")

        iterations = 0
        max_iterations = 6
        while len(combined) > max_chars and iterations < max_iterations:
            iterations += 1
            c_chunks = [combined[i:i + 1000] for i in range(0, len(combined), 1000)]
            next_chunks = []
            for c in c_chunks:
                c = c.strip()
                if not c:
                    continue
                c_len = len(c)
                auto_max = max(25, min(int(c_len * 0.4), 120))
                chosen_max = model_max_len if model_max_len is not None else auto_max
                chosen_min = min(model_min_len, max(10, chosen_max - 1))
                out = _summ(c, max_length=chosen_max, min_length=chosen_min, do_sample=False)
                if out and isinstance(out, list):
                    next_chunks.append(out[0].get("summary_text", "").strip())
            combined = " ".join([s for s in next_chunks if s]).strip()
            if not combined:
                break

        if len(combined) > max_chars:
            return combined[:max_chars].rsplit(" ", 1)[0] + "..."

        return combined

    except Exception:
        _logger.exception("Transformers summarizer not available or failed; falling back to spaCy/heuristic summarizer")

    # spaCy extractive summarizer fallback
    try:
        import spacy

        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text)
        sentences = list(doc.sents)
        if not sentences:
            return ""

        freqs = {}
        for token in doc:
            if token.is_stop or token.is_punct or token.is_space or token.like_num:
                continue
            key = token.lemma_.lower()
            if not key:
                continue
            freqs[key] = freqs.get(key, 0) + 1

        if not freqs:
            raise RuntimeError("No valid tokens for frequency scoring")

        maxf = max(freqs.values())
        for k in list(freqs.keys()):
            freqs[k] = freqs[k] / float(maxf)

        sent_scores = []
        for i, sent in enumerate(sentences):
            sscore = 0.0
            count = 0
            for token in sent:
                if token.is_stop or token.is_punct or token.is_space or token.like_num:
                    continue
                key = token.lemma_.lower()
                if not key:
                    continue
                sscore += freqs.get(key, 0.0)
                count += 1
            if count > 0:
                sscore = sscore / count
            sent_scores.append((i, sscore))

        sent_scores.sort(key=lambda x: x[1], reverse=True)
        top_n = min(5, len(sent_scores))
        selected_idx = sorted([idx for idx, _ in sent_scores[:top_n]])

        summary_sentences = [sentences[i].text.strip() for i in selected_idx]
        summary = " ".join(summary_sentences)
        if len(summary) > max_chars:
            return summary[:max_chars].rsplit(" ", 1)[0] + "..."
        return summary

    except Exception:
        _logger.exception("spaCy summarizer fallback failed; using simple heuristic")
        sentences = re.split(r"(?<=[.!?])\s+", text)
        summary = " ".join(sentences[:3])
        if len(summary) > max_chars:
            return summary[:max_chars].rsplit(" ", 1)[0] + "..."
        return summary