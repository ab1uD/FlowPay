from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt, bcrypt

# IMPORTANT: import models
from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from routes.auth_routes import auth_bp
from routes.wallet_routes import wallet_bp
from routes.transaction_routes import transaction_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(wallet_bp)
app.register_blueprint(transaction_bp)

db.init_app(app)
jwt.init_app(app)
bcrypt.init_app(app)

@app.route("/")
def home():
    return {"message": "FlowPay API running"}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)