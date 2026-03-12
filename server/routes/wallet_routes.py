from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.wallet import Wallet
from models.user import User
from extensions import db

wallet_bp = Blueprint("wallet", __name__, url_prefix="/wallet")


@wallet_bp.route("", methods=["GET"])
@jwt_required()
def get_wallet():

    user_id = get_jwt_identity()

    wallet = Wallet.query.filter_by(user_id=user_id).first()

    return jsonify({
        "id": wallet.id,
        "balance": wallet.balance
    })


@wallet_bp.route("/add", methods=["POST"])
@jwt_required()
def add_money():
    user_id = get_jwt_identity()
    
    data = request.get_json()
    amount = data.get("amount")
    
    if not amount or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404
    
    wallet.balance += amount
    db.session.commit()
    
    return jsonify({
        "id": wallet.id,
        "balance": wallet.balance
    })