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
    # compute new id safely: ignore entries without numeric id
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

    # Ensure payload is a dict
    if not isinstance(novo_comercio, dict):
        novo_comercio = {}

    novo_comercio = dict(novo_comercio)
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