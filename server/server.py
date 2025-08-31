import os
from flask import Flask, request, jsonify, render_template
from . import util
from flask_cors import CORS

# Initialize Flask app and specify template folder path relative to this file
app = Flask(__name__, template_folder="../UI", static_folder="../UI/static")
CORS(app)  # Enable CORS for all routes

@app.route("/")
def home():
    return render_template("app.html")

@app.route("/classify_image", methods=["POST"])
def classify_image():
    # Check if Content-Type is JSON or form data
    if request.is_json:
        data = request.get_json()
        image_data = data.get("image_data") if data else None
    else:
        image_data = request.form.get("image_data")

    if not image_data:
        return jsonify({"error": "Missing image_data"}), 400

    try:
        # Call your utility function to classify the image
        result = util.classify_image(image_data)
        return jsonify(result)
    except Exception as e:
        # Handle exceptions gracefully
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Python Flask Server")
    util.load_saved_artifacts()  # Load your model/artifacts here
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
