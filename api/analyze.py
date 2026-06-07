from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# 1. Add the root directory to path so we can import our custom logic
# Vercel places the api/ folder in a way where .. is the root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from bachat_buddy_ai.main import run_analysis
except ImportError as e:
    print(f"Import Error: {e}")
    # Fallback/Diagnostic
    run_analysis = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 1. Parse Request
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error(400, "Missing body")
                return

            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            setu_json = data.get('setu_json')

            if not setu_json:
                self._send_error(400, "Missing setu_json field")
                return

            # 2. Check for API Key
            if not os.environ.get("GOOGLE_API_KEY"):
                # Use a fallback if strictly necessary for the demo, 
                # but ideally it should be in Vercel Env Vars.
                print("WARNING: GOOGLE_API_KEY not found in environment")

            # 3. RUN AI LOGIC
            # Note: sequential crewAI can take >10s. 
            # We hope for the best or rely on Pro plan 60s timeout if available.
            if run_analysis:
                result = run_analysis(setu_json)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                # Enable CORS just in case, though relative calls don't need it
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "summary": str(result),
                    "status": "success"
                }
                self.wfile.write(json.dumps(response).encode())
            else:
                self._send_error(500, "AI Logic not properly loaded")

        except Exception as e:
            print(f"Serverless Error: {str(e)}")
            self._send_error(500, str(e))

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"detail": message}).encode())

    def do_OPTIONS(self):
        # Handle Preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
