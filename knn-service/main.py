from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from knn_service import knn, scaler, target_names
import numpy as np
import uvicorn

app = FastAPI()

class FeatureInput(BaseModel):
    features: list[float]

@app.post("/predict")
async def predict_niche(input_data: FeatureInput):
    try:
        # Convertendo para numpy e validando
        features = np.array(input_data.features, dtype=float)

        if features.ndim != 1 or len(features) != scaler.mean_.shape[0]:
            raise ValueError("Número de features inválido.")

        # Reformatando para 2D e escalando
        features_scaled = scaler.transform([features])

        # Fazendo a predição
        prediction = knn.predict(features_scaled)[0]

        return {"recommendation": target_names[prediction]}

    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/retrain")
async def retrain_model():
    from train_from_db import train_model_from_db
    try:
        model, new_scaler, accuracy, labels = train_model_from_db()
        # atualiza objetos globais
        global knn, scaler, target_names
        knn = model
        scaler = new_scaler
        target_names = labels
        return {"message": "Modelo treinado com sucesso!", "accuracy": accuracy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao treinar modelo: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
