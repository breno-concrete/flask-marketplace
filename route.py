from flask import Flask, render_template, jsonify
import json
from models.json_store import carregar_dados

app = Flask(__name__)

#home do site
@app.route('/')
def homepage():
    return render_template("homepage.html")


@app.route('/api/usuarios')
def get_usuarios():
    return jsonify(carregar_dados('data/usuarios.json'))




@app.route('/api/comercios')
def get_comercios():
    return jsonify(carregar_dados('data/comercios.json'))


@app.route('/comercios')
def produtos():
    return render_template("produtos.html")

@app.route('/add')
def add_comercio():
    return render_template("add.html")


#ver edição enquanto modifica o código
if __name__ == "__main__":
    app.run(debug=True)
