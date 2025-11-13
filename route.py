from flask import Flask, render_template
import json

app = Flask(__name__)

#home do site
@app.route('/')
def homepage():
    return render_template("homepage.html")

@app.route('/produtos')
def produtos():
    return render_template("produtos.html")

@app.route('/add')
def add_comercio():
    return render_template("add.html")


#ver edição enquanto modifica o código
if __name__ == "__main__":
    app.run(debug=True)
