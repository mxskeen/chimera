#!/bin/bash

echo "Starting chimera Server..."
echo "Opening http://localhost:8000 in your browser..."
echo "⏹Press Ctrl+C to stop the server when done."
echo ""

# Try to open browser on macOS or Linux
if command -v open >/dev/null 2>&1; then
    # macOS
    open http://localhost:8000
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open http://localhost:8000
else
    echo "Could not auto-open browser. Please open http://localhost:8000 manually"
fi

# Start the server
python3 server.py
