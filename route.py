from flask import Flask, render_template, jsonify, request
import json
from models.json_store import carregar_dados, salvar_dados, adicionar_comercio, atualizar_comercio

app = Flask(__name__)

#home do site
@app.route('/')
def homepage():
    return render_template("homepage.html")


@app.route('/api/usuarios')
def get_usuarios():
    return jsonify(carregar_dados('data/usuarios.json'))


#-------- ROTAS API (CRUD) -----------

#READ
@app.route('/api/comercios', methods=['GET'])
def get_comercios():
    return jsonify(carregar_dados('data/comercios.json'))

#CREATE
@app.route('/api/comercios', methods=['POST'])
def create_comercio():
    loja_salva = adicionar_comercio('data/comercios.json', request.json)
    return jsonify(loja_salva)

#UPDATE
@app.route('/api/comercios/<id>', methods= ['PUT'])
def update_comercio(id):
    dados_atualizados = request.json
    comercio_atualizado = atualizar_comercio('data/comercios.json', id, dados_atualizados)
    if comercio_atualizado:
        return jsonify(comercio_atualizado)
    return jsonify({"message": "Comércio não encontrado."}), 404


#DELETE
@app.route('/api/comercios/<id>', methods = ['DELETE'])
def delete_comercio(id):
    if remover_comercio('data/comercios.json', id):
        return jsonify({"message": "Comércio removido com sucesso."})
    return jsonify({"message": "Comércio não encontrado."})




@app.route('/comercios')
def produtos():
    return render_template("produtos.html")

@app.route('/add')
def create_comercio():
    return render_template("add.html")


#ver edição enquanto modifica o código
if __name__ == "__main__":
    app.run(debug=True)
