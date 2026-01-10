#!/usr/bin/env python3
"""Simple HTTP server for local testing."""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8000), NoCacheRequestHandler)
    print("Serving on http://localhost:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()
