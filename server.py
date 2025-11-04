#!/usr/bin/env python3
"""
Simple HTTP server to serve the chimera application locally.
This provides better CORS handling and serves the files properly.

Usage:
    python server.py [port]

Default port is 8000.
Access the app at http://localhost:8000
"""

import http.server
import socketserver
import sys
import os
import webbrowser
from pathlib import Path

def main():
    # Get port from command line argument or use default
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 8000.")

    # Change to the directory containing this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    # Create server
    handler = http.server.SimpleHTTPRequestHandler

    # Add CORS headers
    class CORSRequestHandler(handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()

    try:
        with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
            print(f"🚀 chimera server starting...")
            print(f"📱 Serving at http://localhost:{port}")
            print(f"📁 Directory: {script_dir}")
            print(f"🌐 Open your browser and go to: http://localhost:{port}")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 50)

            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{port}')
                print("🔗 Browser opened automatically")
            except:
                print("⚠️  Could not open browser automatically")

            # Start server
            httpd.serve_forever()

    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use.")
            print(f"💡 Try a different port: python server.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        print("👋 Thanks for using chimera!")

if __name__ == "__main__":
    main()
