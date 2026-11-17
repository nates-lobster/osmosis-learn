#!/usr/bin/env python3
"""Local Osmosis web server with browser state stored outside tracked source files."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
from threading import Lock

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "user_data"
STATE_FILE = DATA_DIR / "osmosis-state.json"
MAX_BODY = 20 * 1024 * 1024
SAVE_LOCK = Lock()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/state":
            if STATE_FILE.exists():
                try:
                    payload = json.loads(STATE_FILE.read_text(encoding="utf-8"))
                except (OSError, json.JSONDecodeError):
                    self.send_error(500, "Could not read local learning data")
                    return
            else:
                payload = None
            body = json.dumps(payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_PUT(self):
        if self.path != "/api/state":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY:
                self.send_error(413, "Invalid state size")
                return
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or not isinstance(payload.get("questions"), list):
                self.send_error(400, "Expected an Osmosis state object")
                return
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with SAVE_LOCK:
                temp = STATE_FILE.with_suffix(".tmp")
                temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                temp.replace(STATE_FILE)
        except (ValueError, OSError, json.JSONDecodeError):
            self.send_error(400, "Could not save local learning data")
            return
        self.send_response(204)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

if __name__ == "__main__":
    address = os.environ.get("OSMOSIS_HOST", "127.0.0.1")
    port = int(os.environ.get("OSMOSIS_PORT", "8000"))
    print(f"Osmosis running at http://{address}:{port}")
    print(f"Private local data: {DATA_DIR}")
    ThreadingHTTPServer((address, port), Handler).serve_forever()
