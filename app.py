import os
from flask import Flask, render_template
import fish

app = Flask(__name__, template_folder="templates")

@app.route("/")
def home():
    return render_template("home.html")

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))