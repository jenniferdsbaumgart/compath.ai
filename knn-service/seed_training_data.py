import numpy as np
import pymongo
import random

# Seed para resultados reprodutíveis
np.random.seed(42)
random.seed(42)

# Conexão Mongo
client = pymongo.MongoClient("mongodb://mongo:27017")
db = client["compath"]
training_collection = db["training_data"]
profiles_collection = db["profiles"]

# Limpa a coleção de training data
training_collection.delete_many({})

# Busca todos os nichos salvos no banco (Profile.niches)
profiles = profiles_collection.find({})
all_niches = []
for profile in profiles:
    for niche in profile.get("niches", []):
        all_niches.append(niche["niche"])

print(f"Total de nichos encontrados no banco: {len(all_niches)}")

# Função para gerar features sintéticas realistas
def generate_features(niche_name):
    # Regras simplificadas de geração com base no nome
    education = int(np.clip(np.random.normal(3, 1), 1, 6))
    audience = int(np.clip(np.random.normal(3, 1), 1, 6))
    investment = int(np.clip(np.random.normal(10000, 5000), 0, 50000))
    time = int(np.clip(np.random.normal(30, 10), 5, 60))
    creativity = float(np.clip(np.random.beta(2, 2), 0, 1))
    tech = float(np.clip(np.random.beta(2, 2), 0, 1))

    return [education, audience, investment, time, creativity, tech]

# Insere dados sintéticos para cada nicho
total_inserted = 0
for niche in all_niches:
    inserted_count = 0
    for _ in range(30):  # 30 variações por nicho para maior robustez
        features = generate_features(niche)
        training_collection.insert_one({
            "features": features,
            "label": niche
        })
        inserted_count += 1
    print(f"{niche}: {inserted_count} registros inseridos")
    total_inserted += inserted_count

print(f"✅ Dados sintéticos inseridos com sucesso: {total_inserted} documentos.")
