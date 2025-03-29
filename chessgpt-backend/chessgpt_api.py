import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import chess.engine

app = Flask(__name__)
# Allow CORS for all origins temporarily (we’ll update this later)
CORS(app, resources={r"/chessgpt": {"origins": "*"}})

# Path to the Stockfish binary (we’ll add it in the next step)
STOCKFISH_PATH = "stockfish"  # Adjust this based on the platform

# Initialize the Stockfish engine
print("Initializing Stockfish engine...")
try:
    engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
    print("Stockfish engine initialized successfully!")
except Exception as e:
    print(f"Error initializing Stockfish: {e}")
    raise

@app.route("/chessgpt", methods=["POST"])
def chessgpt():
    try:
        data = request.json
        fen = data.get("fen", chess.STARTING_FEN)  # Default to starting position if no FEN provided
        prompt = data.get("prompt", "")  # Optional: user question for context

        # Validate the FEN
        try:
            board = chess.Board(fen)
        except ValueError as e:
            return jsonify({"error": f"Invalid FEN: {str(e)}"}), 400

        # Analyze the position with Stockfish
        limit = chess.engine.Limit(time=0.1)  # Limit thinking time to 0.1 seconds for quick response
        result = engine.analyse(board, limit)

        # Get the best move
        best_move = result["pv"][0] if "pv" in result else None
        if not best_move:
            return jsonify({"error": "No move found"}), 500

        # Get the evaluation score (in centipawns)
        score = result["score"].relative.score(mate_score=10000)  # Convert to centipawns, or 10000 for mate
        if score is None:
            score = "Unknown"
        else:
            score = f"{score / 100:+.2f}"  # Convert to a human-readable format (e.g., +0.50)

        # Format the response
        response = {
            "best_move": best_move.uci(),  # e.g., "e2e4"
            "evaluation": score,  # e.g., "+0.50" or "M#3" for checkmate in 3
            "from": best_move.from_square,  # e.g., 12 (square index for e2)
            "to": best_move.to_square  # e.g., 28 (square index for e4)
        }

        # Add a human-readable message based on the prompt
        if prompt:
            response["message"] = f"For the position {fen}, the best move is {best_move.uci()} with an evaluation of {score}."

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.teardown_appcontext
def shutdown_engine(exception=None):
    
    if 'engine' in globals():
        engine.quit()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
