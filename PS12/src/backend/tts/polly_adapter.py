"""
Polly adapter removed.

This project no longer includes AWS/Polly support. The file remains as a stub
so existing imports do not crash; if your code attempts to use this adapter it
will raise an informative error.
"""


class PollyAdapter:
    def __init__(self, *args, **kwargs):
        raise RuntimeError("PollyAdapter has been removed from this project. Use the local pyttsx3 adapter instead.")

