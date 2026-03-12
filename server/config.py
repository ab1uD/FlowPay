class Config:

    SECRET_KEY = "supersecretkey"

    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:1234@localhost/flowpay_db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "jwtsecretkey"

    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

    JWT_TOKEN_LOCATION = ["headers"]

    JWT_HEADER_NAME = "Authorization"

    JWT_HEADER_TYPE = "Bearer"