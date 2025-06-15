import os
import joblib
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_PATH = "knn_model.joblib"

class KNNService:
    def __init__(self, n_neighbors=5):
        self.n_neighbors = n_neighbors
        self.model = None

    def train(self, X: np.ndarray, y: np.ndarray):
        self.model = KNeighborsClassifier(n_neighbors=self.n_neighbors)
        self.model.fit(X, y)
        self.save_model()
        return self.evaluate(X, y)

    def predict(self, X: np.ndarray):
        if self.model is None:
            self.load_model()
        return self.model.predict(X)

    def save_model(self):
        if self.model:
            joblib.dump(self.model, MODEL_PATH)

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError("Modelo KNN não encontrado. Treine o modelo primeiro.")

    def evaluate(self, X: np.ndarray, y: np.ndarray):
        preds = self.model.predict(X)
        return accuracy_score(y, preds)