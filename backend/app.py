from flask import Flask
from flask_cors import CORS
from config import Config
from routes import users_blueprint as bp
from extensions import migrate, Base, Session, engine

def create_app():
    app = Flask(__name__)
    Config.init_app(app)
    CORS(app)
    migrate.init_app(app, Session)

    # Create the database tables if they don't exist
    with app.app_context():
        Base.metadata.create_all(engine)

    app.register_blueprint(bp())
    return app