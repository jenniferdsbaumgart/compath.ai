import numpy as np
import pymongo
import random

client = pymongo.MongoClient("mongodb://mongo:27017")
db = client["compath"]
collection = db["training_data"]
collection.delete_many({})

# Cada entrada: (label, média, desvio padrão) para cada feature
nichos = [
    ("Loja de Produtos Naturais",       [2, 2, 500, 40, 0.4, 0.6]),
    ("Padaria",                         [3, 3, 50000, 60, 0.3, 0.5]),
    ("Agência de Viagens",             [4, 3, 10000, 30, 0.2, 0.4]),
    ("Eventos Comunitários",           [2, 1, 200, 10, 0.3, 0.3]),
    ("Mercearia",                      [5, 4, 15000, 50, 0.2, 0.5]),
    ("Consultoria Empresarial",        [6, 5, 1000, 20, 0.1, 0.7]),
    ("Papelaria",                      [3, 2, 10000, 45, 0.1, 0.6]),
    ("Distribuidora de Bebidas",      [4, 5, 30000, 60, 0.1, 0.5]),
    ("Consultoria Financeira",        [3, 3, 0, 25, 0.1, 0.7]),
    ("Presentes e Decoração",         [2, 2, 10000, 50, 0.6, 0.3]),
    ("Brechó",                         [1, 2, 500, 10, 0.7, 0.2]),
    ("Criação de Filtros AR",         [4, 4, 0, 30, 0.8, 0.2]),
    ("Produtos Customizados",         [3, 2, 500, 25, 0.6, 0.4]),
    ("Lanchonete",                     [3, 2, 20000, 60, 0.3, 0.6]),
    ("Podcast",                        [2, 2, 100, 10, 0.5, 0.5]),
    ("Narração e Locução",            [4, 3, 200, 15, 0.4, 0.5]),
    ("Manutenção de PCs",             [2, 4, 300, 20, 0.4, 0.4]),
    ("Redes e Conectividade",         [3, 5, 100, 15, 0.3, 0.3]),
    ("Dashboards Inteligentes",       [4, 5, 0, 20, 0.5, 0.2]),
    ("Consultoria de Software",       [5, 5, 0, 15, 0.3, 0.5])
]

# Cria variações sintéticas
for label, base in nichos:
    for _ in range(20):  # gera 20 variações por nicho
        variation = [
            int(np.clip(np.random.normal(base[0], 0.5), 1, 6)),     # education
            int(np.clip(np.random.normal(base[1], 0.5), 1, 6)),     # audience
            int(np.clip(np.random.normal(base[2], base[2]*0.3), 0, 50000)),  # investimento
            int(np.clip(np.random.normal(base[3], 5), 5, 60)),      # tempo
            float(np.clip(np.random.normal(base[4], 0.1), 0, 1)),   # criatividade
            float(np.clip(np.random.normal(base[5], 0.1), 0, 1))    # tech
        ]
        collection.insert_one({
            "features": variation,
            "label": label
        })

print("Dados sintéticos inseridos com sucesso!")
