import numpy as np
import pymongo
import requests

# === 1. Gera dados sintéticos ===
X = np.array([
    [2, 2, 500, 40, 0.4, 0.6],
    [3, 3, 50000, 60, 0.3, 0.5],
    [4, 3, 10000, 30, 0.2, 0.4],
    [2, 1, 200, 10, 0.3, 0.3],
    [5, 4, 15000, 50, 0.2, 0.5],
    [6, 5, 1000, 20, 0.1, 0.7],
    [3, 2, 10000, 45, 0.1, 0.6],
    [4, 5, 30000, 60, 0.1, 0.5],
    [3, 3, 0, 25, 0.1, 0.7],
    [2, 2, 10000, 50, 0.6, 0.3],
    [1, 2, 500, 10, 0.7, 0.2],
    [4, 4, 0, 30, 0.8, 0.2],
    [3, 2, 500, 25, 0.6, 0.4],
    [3, 2, 20000, 60, 0.3, 0.6],
    [2, 2, 100, 10, 0.5, 0.5],
    [4, 3, 200, 15, 0.4, 0.5],
    [2, 4, 300, 20, 0.4, 0.4],
    [3, 5, 100, 15, 0.3, 0.3],
    [4, 5, 0, 20, 0.5, 0.2],
    [5, 5, 0, 15, 0.3, 0.5]
])

y = [
    "Loja de Produtos Naturais",
    "Padaria",
    "Agência de Viagens",
    "Eventos Comunitários",
    "Mercearia",
    "Consultoria Empresarial",
    "Papelaria",
    "Distribuidora de Bebidas",
    "Consultoria Financeira",
    "Presentes e Decoração",
    "Brechó",
    "Criação de Filtros AR",
    "Produtos Customizados",
    "Lanchonete",
    "Podcast",
    "Narração e Locução",
    "Manutenção de PCs",
    "Redes e Conectividade",
    "Dashboards Inteligentes",
    "Consultoria de Software"
]

try:
    # === 2. Conecta no Mongo e atualiza a base ===
    print("📦 Conectando ao MongoDB...")
    client = pymongo.MongoClient("mongodb+srv://jenniferdsbaumgart:RdsJcCSEfPYlfpSB@compath.b3ixylf.mongodb.net/compath?retryWrites=true&w=majority&appName=Compath")  # ou "mongodb://mongo:27017" se estiver em container
    db = client["compath"]
    collection = db["training_data"]

    collection.delete_many({})
    for features, label in zip(X, y):
        collection.insert_one({
            "features": features.tolist(),
            "label": label
        })
    print("✅ Dados inseridos com sucesso no MongoDB!")

except Exception as e:
    print("❌ Erro ao inserir no MongoDB:", e)
    exit()

# === 3. Chama o endpoint de re-treinamento ===
try:
    print("⚙️ Chamando o endpoint de treinamento...")
    response = requests.post("http://localhost:8000/retrain")
    response.raise_for_status()
    data = response.json()

    print("🎉 Modelo treinado com sucesso!")
    print(f"📊 Acurácia: {data.get('accuracy', 'N/A')}")
except Exception as e:
    print("❌ Erro ao treinar o modelo:", e)
