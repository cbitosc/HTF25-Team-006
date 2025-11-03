import pyttsx3
import os
from tempfile import NamedTemporaryFile


class PyTTS3Adapter:
    def __init__(self):
        # Initialize engine per call to avoid state issues in some environments
        self.voice_map = None

    def list_voices(self):
        """Return available system voices as a list of dicts similar to Polly's format."""
        try:
            engine = pyttsx3.init()
            vs = engine.getProperty('voices') or []
            out = []
            for v in vs:
                out.append({
                    'Id': getattr(v, 'id', None) or getattr(v, 'name', None),
                    'Name': getattr(v, 'name', None),
                    'LanguageCode': None,
                    'Gender': None,
                })
            return out
        except Exception:
            return []

    def synthesize(self, text, voice=None, engine=None, output_format=None, text_type=None):
        """
        Synthesize text using local pyttsx3 engine and return bytes (WAV).
        Ignores engine/text_type/output_format and returns WAV bytes.
        """
        tts = pyttsx3.init()
        if voice:
            try:
                # Attempt to set voice by id if available
                tts.setProperty('voice', voice)
            except Exception:
                # ignore if voice cannot be set
                pass

        # Write to a temporary WAV file
        with NamedTemporaryFile(suffix='.wav', delete=False) as out:
            path = out.name
        try:
            tts.save_to_file(text, path)
            tts.runAndWait()
            with open(path, 'rb') as f:
                data = f.read()
            return data
        finally:
            try:
                os.remove(path)
            except Exception:
                pass
