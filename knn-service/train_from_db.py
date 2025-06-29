from pymongo import MongoClient
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import os

def train_model_from_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://compath-mongo:27017/"))
    db = client["compath"]
    collection = db["training_data"]

    data = list(collection.find())

    if not data:
        raise ValueError("Nenhum dado de treinamento encontrado no banco de dados.")

    if not all("features" in d and "label" in d for d in data):
        raise ValueError("Alguns documentos não possuem 'features' ou 'label'.")

    print(f"Total de amostras carregadas do MongoDB: {len(data)}")

    X = np.array([d["features"] for d in data])
    y = np.array([d["label"] for d in data])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    n_neighbors = min(3, len(X_train))
    model = KNeighborsClassifier(n_neighbors=n_neighbors)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    labels = sorted(list(set(y)))
    print(f"Acurácia do modelo: {accuracy:.2%}")
    print(f"Classes únicas encontradas: {labels}")

    return {
        "model": model,
        "scaler": scaler,
        "accuracy": accuracy,
        "labels": labels
    }

if __name__ == "__main__":
    result = train_model_from_db()
    print(f"Modelo treinado com acurácia de {result['accuracy']:.2%}")
    print(f"Classes únicas encontradas: {result['labels']}")
