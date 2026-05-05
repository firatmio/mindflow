# firebase ve gemini api key ayarları burda

import os

from dotenv import load_dotenv

load_dotenv()

FIREBASE_CREDENTIALS_PATH = os.getenv(
    "FIREBASE_CREDENTIALS_PATH"
)  # firebase credentials path
