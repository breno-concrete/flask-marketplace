import json
import os 
import shutil 
from datetime import datetime

def carregar_dados(pasta):
    # se não existe cria uma lsita vazia
    if not os.path.exists(pasta):
        salvar_dados(pasta, [])

    with open(pasta, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            # caso o arquivo esteja corrompido
            data = []

    
    if not isinstance(data, list):
        data = []

    return data #retorna a lista

def salvar_dados(pasta, dados):
    with open(pasta, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)

def adicionar_comercio(pasta, novo_comercio):
    comercios = carregar_dados(pasta)
    # gera id novo
    ids = []
    for comercio in comercios:
        try:
            if 'id' in comercio and isinstance(comercio['id'], int):
                ids.append(comercio['id'])
        except Exception:
            continue

    if not ids:
        new_id = 1
    else:
        new_id = max(ids) + 1

    # é dicionário 
    if not isinstance(novo_comercio, dict):
        novo_comercio = {}

    novo_comercio = dict(novo_comercio) #cópia do dicionário
    novo_comercio["id"] = new_id #id no novo comércio
    comercios.append(novo_comercio) #coloca na lista de comercios
    salvar_dados(pasta, comercios) #salva na lista atualizada

    return novo_comercio

def atualizar_comercio(pasta, id, dados_atualizados):
    comercios = carregar_dados(pasta)

    for comercio in comercios:
        if str(comercio["id"]) == str(id):
            comercio.update(dados_atualizados)
            salvar_dados(pasta, comercios)
            return comercio


def remover_comercio(pasta,id):
    comercios = carregar_dados(pasta)

    for comercio in comercios:
        if str(comercio["id"]) == str(id):
            comercios.remove(comercio)
            salvar_dados(pasta, comercios)
            return True
    return False


# busca usuario pelo email
def buscar_usuario(pasta, email):
    usuarios = carregar_dados(pasta)

    for usuario in usuarios:
        if usuario.get("email") == email:
            return usuario
    return None

def validar_senha_user(usuario, senha):
    if usuario is None:
        return False
    return usuario.get("senha") == senha

def add_user(pasta, novo_usuario):
    usuarios = carregar_dados(pasta)

    ids = []
    for usuario in usuarios:
        try:
            if 'id' in usuarios and isinstance(usuario["id"], int):
                ids.append(usuario["id"])
        except Exception:
            continue
    
    if not ids:
        new_id = 1
    else:
        new_id = max(ids) + 1

    if not isinstance(novo_usuario, dict):
        novo_usuario = {}
    
    novo_usuario = dict(novo_usuario)
    novo_usuario["id"] = new_id
    usuarios.append(novo_usuario)
    salvar_dados(pasta, usuarios)

    return novo_usuario