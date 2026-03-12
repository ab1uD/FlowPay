from extensions import db
from datetime import datetime

class Transaction(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    sender_id = db.Column(db.Integer)

    receiver_id = db.Column(db.Integer)

    amount = db.Column(db.Integer)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)