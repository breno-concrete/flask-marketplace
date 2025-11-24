import json
import os 
import shutil 
from datetime import datetime

def carregar_dados(pasta):
    with open(pasta, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list): #caso não seja uma lista
        raise ValueError("O arquivo JSON deve conter uma lista de objetos.")

    return data #retorna a lista

def salvar_dados(pasta, dados):
    with open(pasta, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)

def adicionar_comercio(pasta, novo_comercio):
    comercios = carregar_dados(pasta)

    new_id = 0
    ids = [] #evitar conflito de ids ao apagar um comercio

    for comercio in comercios:       #pegar ids
        ids.append(comercio["id"])

    if ids == []: #caso seja o primeiro comercio
        new_id = 1
    else:
        new_id = max(ids) + 1 
    
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