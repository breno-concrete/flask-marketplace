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


