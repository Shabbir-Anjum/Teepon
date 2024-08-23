from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker, declarative_base

from flask_migrate import Migrate
from config import Config

import os

def get_db_engine():
    dsn = URL.create(
        drivername="mysql+pymysql",
        username=Config.TIDB_USER,
        password=Config.TIDB_PASSWORD,
        host=Config.TIDB_HOST,
        port=Config.TIDB_PORT,
        database=Config.TIDB_DATABASE,
    )
    connect_args = {
        "ssl": {
            "ca": os.getenv('CA_PATH', '/etc/ssl/certs/ca-certificates.crt'),
            # "cert": None,
            # "key": None,
        }
    }
    return create_engine(dsn, connect_args=connect_args)


# Initialize session
engine = get_db_engine()
Session = sessionmaker(bind=engine)
Base = declarative_base()

migrate = Migrate()
