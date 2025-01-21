from flask import Flask, request, jsonify, make_response
import requests
import yfinance as yf
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import time
import pyodbc

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://your-production-domain.com"]}})

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Static crumb value
CRUMB = "HqS9eppvaMD"

# Get the proxy URL from Heroku config vars
PROXY_URL = os.getenv("PROXY_URL")

# Azure SQL connection string
AZURE_SQL_CONNECTION_STRING = os.getenv("AZURE_SQL_CONNECTION_STRING")
conn = pyodbc.connect(AZURE_SQL_CONNECTION_STRING)

# Ensure the BEARER_TOKEN is loaded from the environment
BEARER_TOKEN = os.getenv('BEARER_TOKEN')
if not BEARER_TOKEN:
    raise EnvironmentError("BEARER_TOKEN environment variable is not set")


@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 200


# Retry logic for requests
def fetch_with_retry(url, headers, cookies=None, retries=3, delay=5):
    for attempt in range(retries):
        try:
            proxies = {"http": PROXY_URL, "https": PROXY_URL} if PROXY_URL else None
            response = requests.get(url, headers=headers, cookies=cookies, proxies=proxies, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.debug(f"Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                raise


# Route to fetch stock data
@app.route('/stock-data', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1mo")  # Adjust the period as needed
        data = [
            {
                "date": str(index.date()),
                "price": row["Close"]
            }
            for index, row in hist.iterrows()
        ]
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in /stock-data: {e}")
        return jsonify({"error": str(e)}), 500


# Route to fetch company name
@app.route('/company-name', methods=['GET'])
def get_company_name():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT company_name FROM company_table WHERE ticker = ?", ticker)
        row = cursor.fetchone()
        company_name = row[0] if row else "Unknown Company"
        return jsonify({"company_name": company_name})
    except Exception as e:
        logger.error(f"Error fetching company name for {ticker}: {e}")
        return jsonify({"error": f"Internal Server Error: {e}"}), 500


# Route to fetch top accounts feed
@app.route('/top-accounts-feed', methods=['POST'])
def get_top_accounts_feed():
    try:
        # Parse request data
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Request payload is missing"}), 400

        limit = request_data.get('limit', 100)
        start = request_data.get('start')
        end = request_data.get('end')
        asset = request_data.get('asset')
        page = request_data.get('page', 1)

        # Validate required fields
        if not start or not end or not asset:
            return jsonify({"error": "Missing required fields: 'start', 'end', 'asset'"}), 400

        logger.debug(f"Payload: start={start}, end={end}, asset={asset}, page={page}, limit={limit}")

        # Set up headers
        headers = {
            'Authorization': f"Bearer {BEARER_TOKEN}",
            'Content-Type': 'application/json'
        }

        # Payload for external API
        payload = {
            'start': start,
            'end': end,
            'asset': asset,
            'page': page,
            'limit': limit
        }

        # Send POST request to external API
        response = requests.post('http://api.playfairapp.com/top-accounts-feed', headers=headers, json=payload)
        response.raise_for_status()

        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in /top-accounts-feed: {e}")
        return jsonify({"error": f"Network error: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Error occurred in /top-accounts-feed: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
