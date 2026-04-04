# FlowPay

FlowPay is a full-stack peer-to-peer digital wallet system built with a Next.js frontend and a Flask backend. Users can register, login, manage wallet balances, add funds, transfer money to other users, and view transaction history.

## Features

- User registration and login with JWT authentication
- Wallet creation and balance tracking
- Add money to the wallet
- Secure wallet-to-wallet transfers
- Recipient wallet verification before transfer
- Transaction history for sent and received transfers
- Next.js frontend with React and Tailwind CSS
- Flask backend with SQLAlchemy and PostgreSQL

## Project Structure

- `frontend/`
  - Next.js application
  - `app/` contains pages for dashboard, login, register, and transfer
  - `components/`, `context/`, `utils/api.ts` for client-side API integration
- `server/`
  - Flask API application
  - `models/` defines `User`, `Wallet`, and `Transaction`
  - `routes/` contains auth, wallet, and transaction endpoints
  - `extensions.py` initializes database, JWT, and bcrypt
  - `config.py` contains application configuration

## Backend API Endpoints

- `POST /auth/register` — register a new user
- `POST /auth/login` — login and receive JWT token
- `GET /wallet` — get current user wallet ID and balance
- `POST /wallet/add` — add money to current wallet
- `GET /wallet/verify/<wallet_id>` — verify the recipient wallet exists
- `GET /transactions` — get transaction history for current wallet
- `POST /transactions/transfer` — transfer money to another wallet

## Setup

### Backend

1. Open a terminal and navigate to `server/`
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the database connection in `server/config.py` if needed.
   - Default: `postgresql://postgres:1234@localhost/flowpay_db`
5. Run the backend:
   ```bash
   python app.py
   ```

### Frontend

1. Open a terminal and navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Optional: set the API URL if different from the default
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

## Usage

1. Register a new user and login.
2. On the dashboard, view wallet balance and wallet ID.
3. Add money to your wallet using the Add Money action.
4. To transfer funds, use another user's wallet ID from their dashboard.
5. Verify the recipient wallet before submitting the transfer.
6. Check the dashboard transaction history for sent/received activity.

## Notes

- The recipient wallet ID must match an existing customer wallet in the system.
- Transfers to your own wallet are blocked to avoid invalid self-transfers.
- If there are no other users yet, register a second account to test transfers.
- Ensure the backend is running on port `5000` before using the frontend.
