from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.wallet import Wallet
from models.transaction import Transaction

transaction_bp = Blueprint("transaction", __name__, url_prefix="/transactions")


# TRANSFER MONEY
@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer():

    sender_id = get_jwt_identity()
    data = request.get_json()

    receiver_wallet_id = data.get("wallet_id")
    amount = data.get("amount")

    sender_wallet = Wallet.query.filter_by(user_id=sender_id).first()
    receiver_wallet = Wallet.query.get(receiver_wallet_id)

    # Fallback: allow lookup by user_id if the sender uses the recipient's user ID
    if not receiver_wallet:
        receiver_wallet = Wallet.query.filter_by(user_id=receiver_wallet_id).first()

    if not receiver_wallet:
        return jsonify({"error": "Recipient wallet not found. Use the recipient's wallet ID from their dashboard."}), 404

    if sender_wallet.id == receiver_wallet.id:
        return jsonify({"error": "Cannot transfer to your own wallet"}), 400

    if sender_wallet.balance < amount:
        return jsonify({"error": "Insufficient balance"}), 400

    sender_wallet.balance -= amount
    receiver_wallet.balance += amount

    transaction = Transaction(
        sender_id=sender_wallet.id,
        receiver_id=receiver_wallet.id,
        amount=amount
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Transfer successful"})


# GET TRANSACTIONS
@transaction_bp.route("", methods=["GET"])
@jwt_required()
def get_transactions():

    user_id = get_jwt_identity()

    wallet = Wallet.query.filter_by(user_id=user_id).first()

    transactions = Transaction.query.filter(
        (Transaction.sender_id == wallet.id) |
        (Transaction.receiver_id == wallet.id)
    ).all()

    results = []

    for t in transactions:
        # Determine if this is money sent or received
        is_sender = t.sender_id == wallet.id
        results.append({
            "amount": t.amount,
            "type": "sent" if is_sender else "received",
            "other_party_wallet_id": t.receiver_id if is_sender else t.sender_id
        })

    return jsonify(results)