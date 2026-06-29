"""Flask entry point for ModEval."""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from backend.routes.analyze import analyze_bp
from backend.routes.batch import batch_bp
from backend.routes.models import models_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    app = Flask(__name__, static_folder=str(frontend_dir), static_url_path="")

    CORS(app, origins=[
        "https://modeval.bynipun.com",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ])

    app.register_blueprint(analyze_bp)
    app.register_blueprint(batch_bp)
    app.register_blueprint(models_bp)

    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return jsonify({"error": "Rate limit exceeded"}), 429

    @app.errorhandler(500)
    def handle_internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    @app.get("/health")
    def healthcheck():
        return jsonify({"status": "ok"})

    @app.get("/")
    def serve_index():
        response = send_from_directory(app.static_folder, "index.html")
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

    @app.get("/og-image.png")
    def serve_og_image():
        return send_from_directory(app.static_folder, "og-image.png")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")
