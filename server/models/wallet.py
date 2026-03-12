from extensions import db

class Wallet(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    balance = db.Column(db.Integer, default=0)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))