from flask import Flask, request, jsonify, send_file, Response
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import os
import tempfile
import logging
import base64
from utils import extract_text_from_file, clean_text, summarize_text
from dotenv import load_dotenv

# Load .env file from src/backend/.env for local development
load_dotenv()
from tts.pyttsx_adapter import PyTTS3Adapter

ALLOWED_EXTENSIONS = {"pdf", "txt"}

app = Flask(__name__)

# Limit uploads to 10 MiB per request (adjust as needed)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# Basic logging configuration for backend
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default to local pyttsx3 for development to avoid accidental cloud/billing usage.
# TTS_PROVIDER env var is accepted but this project build only supports the
# local pyttsx3 adapter; any other value will fall back to pyttsx3.
TTS_PROVIDER = os.getenv('TTS_PROVIDER', 'pyttsx3').lower()
if TTS_PROVIDER == 'pyttsx3':
    logger.info('Using pyttsx3 local TTS provider')
else:
    logger.info("TTS_PROVIDER set to '%s' but only local pyttsx3 is supported; falling back to pyttsx3", TTS_PROVIDER)

# Always use the local pyttsx3 adapter
tts_adapter = PyTTS3Adapter()


@app.after_request
def add_cors_headers(response):
    # Simple CORS for local development. Replace with flask-cors or stricter rules in production.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    # Return JSON error for oversized uploads
    logger.warning("Upload rejected: request too large")
    return jsonify({"success": False, "error": "File too large. Max size is 10 MB."}), 413


def allowed_filename(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/tts/voices", methods=["GET"])
def tts_voices():
    # Optional query param language, e.g. ?lang=en-US
    lang = request.args.get("lang")
    try:
        # Adapter may implement list_voices; call with language_code where supported.
        voices = []
        if hasattr(tts_adapter, 'list_voices'):
            try:
                voices = tts_adapter.list_voices(language_code=lang)
            except TypeError:
                # adapter does not accept language_code arg
                voices = tts_adapter.list_voices()

        # Return a small piece of metadata to the frontend
        out = [
            {
                "Id": v.get("Id"),
                "LanguageCode": v.get("LanguageCode"),
                "Name": v.get("Name"),
                "Gender": v.get("Gender"),
            }
            for v in voices
        ]
        return jsonify({"voices": out})
    except Exception:
        logger.exception("Failed to list voices")
        return jsonify({"voices": []}), 500


@app.route("/api/tts/preview", methods=["POST"])
def tts_preview():
    """Synthesize a short text and return audio bytes (audio/mpeg). Expects JSON {text, voiceId, engine}
    Use this for UI preview only (cap length on server).
    """
    data = request.get_json() or {}
    text = data.get("text", "")
    voice = data.get("voiceId", "Joanna")
    engine = data.get("engine", "neural")

    if not text or len(text) > 2000:
        return jsonify({"error": "text required and must be <= 2000 chars for preview"}), 400

    try:
        # local adapter produces WAV
        audio_bytes = tts_adapter.synthesize(text, voice=voice, engine=engine, output_format='wav', text_type='text')
        if not audio_bytes:
            return jsonify({"error": "no audio returned"}), 500
        mimetype = 'audio/wav'
        return Response(audio_bytes, mimetype=mimetype)
    except Exception:
        logger.exception("TTS synth failed for preview")
        return jsonify({"error": "synthesis failed"}), 500


@app.route("/api/generate-podcast", methods=["POST", "OPTIONS"])
def generate_podcast():
    # Respond to preflight
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    """
    Expected multipart/form-data with a single file field named 'file'.
    This endpoint performs:
      - basic auth placeholder (Authorization header optional for now)
      - text extraction (pdf/txt)
      - cleaning of extracted text
      - summarization stub (replace with AI call later)

    Returns JSON with { success, summary, audio_url }
    Note: TTS and cloud storage are not implemented in this scaffold.
    """
    # Basic auth placeholder (replace with real auth in prod)
    auth = request.headers.get("Authorization")
    if not auth:
        # allow for local testing but note in the response
        auth_notice = "no-authorization-provided"
    else:
        auth_notice = "authorization-present"

    if "file" not in request.files:
        return jsonify({"success": False, "error": "missing file in request"}), 400

    # Wrap processing in try/except to return clear 500's and log details
    try:
        file = request.files["file"]
        filename = secure_filename(file.filename or "")

        # Basic filename checks
        if filename == "" or not allowed_filename(filename):
            return jsonify({"success": False, "error": "invalid or missing filename (allowed: .pdf, .txt)"}), 400
        if len(filename) > 200:
            return jsonify({"success": False, "error": "filename too long"}), 400

        # Save to a temporary file for processing
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = os.path.join(tmpdir, filename)
            file.save(tmp_path)

            # Extract text (may raise/log on error)
            raw_text = extract_text_from_file(tmp_path)
            if not raw_text or raw_text.strip() == "":
                return jsonify({"success": False, "error": "no text extracted from file"}), 400

            # Clean the text
            cleaned = clean_text(raw_text)

            # Summarize (stub) - replace this with an AI provider call later
            summary = summarize_text(cleaned)

            # If caller provided a voice, synthesize audio for the summary (synchronous)
            audio_b64 = None
            audio_ct = None
            voice_choice = request.form.get('voice') or request.args.get('voice') or 'Joanna'
            try:
                # produce WAV via local adapter
                audio_bytes = tts_adapter.synthesize(summary, voice=voice_choice, engine='neural', output_format='wav')
                if audio_bytes:
                    audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
                    audio_ct = 'audio/wav'
            except Exception:
                logger.exception('TTS synthesis failed for generated summary')
                audio_b64 = None
    except RequestEntityTooLarge:
        # Let the registered errorhandler handle this
        raise
    except Exception as exc:
        # Log full traceback and return a generic 500 to the client
        logger.exception("Failed processing uploaded file")
        return jsonify({"success": False, "error": "internal server error during file processing"}), 500

    # No TTS or storage implemented here. Provide a placeholder audio_url field.
    result = {
        "success": True,
        "auth": auth_notice,
        "summary": summary,
        # For now we return synthesized audio inline as base64 so frontend can play it without storage
        "audio_base64": audio_b64,
        "audio_content_type": audio_ct,
        "audio_url": None,
        "note": "For POC the audio is returned inline as base64 in `audio_base64`. Later upload to cloud storage and return audio_url.",
    }

    return jsonify(result)


if __name__ == "__main__":
    # For local dev only. In production, use a WSGI server.
    app.run(host="127.0.0.1", port=5000, debug=True)