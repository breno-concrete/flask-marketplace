from flask import Flask, render_template, jsonify, request
import json
from models.json_store import (
    carregar_dados, salvar_dados, adicionar_comercio, 
    atualizar_comercio, remover_comercio,
    buscar_usuario, validar_senha_user, add_user
)
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
    try:
        payload = request.get_json(force=True)
    except Exception:
        return jsonify({"message": "JSON inválido no corpo da requisição."}), 400

    if not payload or not isinstance(payload, dict) or not payload.get('nome'):
        return jsonify({"message": "Dados inválidos: 'nome' é obrigatório."}), 400

    try:
        loja_salva = adicionar_comercio('data/comercios.json', payload)
        return jsonify(loja_salva), 201
    except Exception as e:
        return jsonify({"message": "Erro ao salvar comércio.", "detail": str(e)}), 500

#UPDATE
@app.route('/api/comercios/<id>', methods= ['PUT'])
def update_comercio(id):
    try:
        dados_atualizados = request.get_json(force=True)
    except Exception:
        return jsonify({"message": "JSON inválido no corpo da requisição."}), 400

    if not dados_atualizados or not isinstance(dados_atualizados, dict):
        return jsonify({"message": "Dados inválidos para atualização."}), 400

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
@app.route('/produtos')
def produtos():
    return render_template("produtos.html")

@app.route('/add')
def add_page():
    return render_template("add.html")






#------------------------------------------ROTAS de LOGIN e SIGNUP------------------------------------------
@app.route('/api/login', methods=['POST'])
def login_user():
    try:
        dados = request.get_json(force=True)
    except Exception:
        return jsonify({"message": "JSON inválido no corpo da requisição."}), 400
    email = dados.get('email')
    senha = dados.get('senha') 

    #valida se campo foi prenchido
    if not email or not senha:
        return jsonify({"message": "Email e senha são obrigatórios."}), 400
    
    usuario = buscar_usuario('data/usuarios.json', email) #acha o user

    if validar_senha_user(usuario, senha): #valida senha e retorna dicionário das infos do usuario
        return jsonify({
            "id": usuario['id'],
            "email": usuario['email'],
            "nome": usuario['nome']
        }), 200

    return jsonify({"message": "Email ou senha incorretos."}), 401 #retona erro caso a senha ou email estejam errados

@app.route('/api/signup', methods=['POST'])
def register():
    try:
        dados = request.get_json(force=True)
    except Exception:
        return jsonify({"message": "JSON inválido."}), 400

    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    if not nome or not email or not senha:
        return jsonify({"message": "Nome, email e senha são obrigatórios."}), 400
        
    usuario_existente = buscar_usuario('data/usuarios.json', email)
    if usuario_existente:
        return jsonify({"message": "Já existe um usuário com este email."}), 409

    novo_usuario = {
        "nome": nome,
        "email": email,
        "senha": senha
    }

    usuario_criado = add_user('data/usuarios.json', novo_usuario)
    return jsonify(usuario_criado), 201

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/perfil')
def perfil_page():
    return render_template("perfil.html")



#ver edição enquanto modifica o código
if __name__ == "__main__":
    app.run(debug=True)
