from pymongo import MongoClient
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import os

def train_model_from_db():
    # Conecta no MongoDB
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
    db = client["compath"]
    collection = db["training_data"]

    data = list(collection.find())

    if not data:
        raise ValueError("Nenhum dado de treinamento encontrado no banco de dados.")

    X = np.array([d["features"] for d in data])
    y = np.array([d["label"] for d in data])

    # Normaliza
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Divide para avaliação
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # Treina o modelo
    model = KNeighborsClassifier(n_neighbors=3)
    model.fit(X_train, y_train)

    # Avalia
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Extrai labels únicas na ordem
    labels = sorted(list(set(y)))

    return model, scaler, accuracy, labels
