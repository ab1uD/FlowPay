from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models.user import User
from models.wallet import Wallet
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    # create wallet automatically
    wallet = Wallet(user_id=new_user.id, balance=0)
    db.session.add(wallet)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Invalid email"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid password"}), 401

    token = create_access_token(identity=user.id)

    return jsonify({
        "token": token,
        "user": user.email
    })