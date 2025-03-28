import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import bitsandbytes as bnb  # For quantization

app = Flask(__name__)
# Allow CORS for all origins temporarily (we’ll update this later)
CORS(app, resources={r"/chessgpt": {"origins": "*"}})

# Load the ChessGPT model on CPU with 4-bit quantization
print("Loading ChessGPT model...")
try:
    tokenizer = AutoTokenizer.from_pretrained("Waterhorse/chessgpt-chat-v1")
    model = AutoModelForCausalLM.from_pretrained(
        "Waterhorse/chessgpt-chat-v1",
        device_map="cpu",  # Use CPU instead of CUDA
        load_in_4bit=True,  # Quantize the model to 4-bit precision
        low_cpu_mem_usage=True  # Optimize for low memory usage
    )
    model.eval()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

@app.route("/chessgpt", methods=["POST"])
def chessgpt():
    try:
        data = request.json
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        formatted_prompt = f"A friendly, helpful chat between some humans.<|endoftext|>Human 0: {prompt}<|endoftext|>Human 1:"
        inputs = tokenizer(formatted_prompt, return_tensors="pt")
        input_length = inputs.input_ids.shape[1]

        outputs = model.generate(
            **inputs,
            max_new_tokens=128,
            do_sample=True,
            temperature=0.7,
            top_p=0.7,
            top_k=50,
            return_dict_in_generate=True
        )
        token = outputs.sequences[0, input_length:]
        response = tokenizer.decode(token, skip_special_tokens=True)

        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))