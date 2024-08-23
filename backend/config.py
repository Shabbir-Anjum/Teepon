import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TIDB_HOST = os.getenv("TIDB_HOST", "127.0.0.1")
    TIDB_PORT = int(os.getenv("TIDB_PORT", "4000"))
    TIDB_USER = os.getenv("TIDB_USER", "root")
    TIDB_PASSWORD = os.getenv("TIDB_PASSWORD", "")
    TIDB_DATABASE = os.getenv("TIDB_DATABASE", "test")
    CA_PATH = os.getenv("CA_PATH", "")

    @staticmethod
    def init_app(app):
        app.config.from_object(Config)
