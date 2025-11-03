# Backend (Flask) scaffold

This folder contains a small Flask scaffold for Phase 2 (file upload, text extraction and cleaning).

Quick start (PowerShell)

1. Create and activate a virtual environment (recommended):

```powershell
cd src\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the server (development):

```powershell
#$env:FLASK_APP = "app.py"
#$env:FLASK_ENV = "development"
python app.py
```

4. Test the health endpoint:

```powershell
curl http://127.0.0.1:5000/api/health
```

5. Test file upload (PowerShell example using curl):

```powershell
curl -X POST "http://127.0.0.1:5000/api/generate-podcast" -H "Authorization: Bearer testtoken" -F "file=@C:/path/to/your/file.pdf"
```

Notes
- The endpoint currently returns a `summary` field and `audio_url` is `null`. Replace the `summarize_text()` function with a call to your chosen AI summarizer and add a TTS/upload step to produce `audio_url`.
- `utils.py` uses PyMuPDF (fitz) to extract PDF text and a small cleaning heuristic. The heuristics are intentionally simple and should be improved for production.

spaCy summarization
- We added an extractive summarizer using spaCy in `utils.summarize_text()`.
- To use it locally, install the Python dependencies and the English model. For best results (vector-based summarization) install the medium model:

```powershell
cd src\backend
pip install -r requirements.txt
# Small model (works but has no vectors):
python -m spacy download en_core_web_sm
# Medium model (recommended - provides word vectors for better summaries):
python -m spacy download en_core_web_md
```

If the spaCy model isn't installed the code will fall back to a conservative first-three-sentences summarizer. If the small `en_core_web_sm` model is installed, the summarizer will use a frequency-based spaCy method; installing `en_core_web_md` enables vector-based ranking (usually much better for extractive summaries).

BART summarizer (transformers)
- This project now supports a local BART summarizer (Hugging Face transformers). If `transformers` and `torch` are installed, `utils.summarize_text()` will use the `sshleifer/distilbart-cnn-12-6` model for abstractive summarization and will chunk long texts automatically.
- Install dependencies (note: torch may need a platform-specific wheel):

```powershell
cd src\backend
pip install -r requirements.txt
# If torch wheel for your platform is not available via pip, follow https://pytorch.org/get-started/locally/ to install the appropriate version.
```

The first run will download the BART model (tens to hundreds of MB depending on model chosen). If transformers isn't available the code will fall back to the spaCy-based extractive summarizer.
