"""Flask entry point for ModEval."""

from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, send_from_directory

from backend.routes.analyze import analyze_bp
from backend.routes.batch import batch_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    app = Flask(__name__, static_folder=str(frontend_dir), static_url_path="")

    app.register_blueprint(analyze_bp)
    app.register_blueprint(batch_bp)

    @app.get("/health")
    def healthcheck():
        return jsonify({"status": "ok"})

    @app.get("/")
    def serve_index():
        return send_from_directory(app.static_folder, "index.html")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
