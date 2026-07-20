from pathlib import Path
from dotenv import load_dotenv

# Load environment variables exactly once during package initialization
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(env_path, override=True)
