from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import uvicorn
from knn_service import knn_service
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou especifique seus domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeatureInput(BaseModel):
    features: list[float]

@app.post("/predict")
async def predict_niche(input_data: FeatureInput):
    try:
        # Convert input features to a NumPy array of type float
        features = np.array(input_data.features, dtype=float)

        # Reshape if the input is a single sample
        if features.ndim == 1:
            features = features.reshape(1, -1)

        # Load the model if it hasn't been loaded yet
        if knn_service.model is None:
            knn_service.load_model()

        # Get prediction probabilities from the model
        probs = knn_service.model.predict_proba(features)[0]

        # Get the indices of the top 5 highest probabilities
        top5_indices = np.argsort(probs)[-5:][::-1]

        # Prepare the top 5 recommendations with their probabilities
        recommendations = []
        for idx in top5_indices:
            recommendations.append({
                "niche": knn_service.model.classes_[idx],
                "probability": float(probs[idx])
            })

        # Return the recommendations as a JSON response
        return {"recommendations": recommendations}

    except Exception as e:
        # Return an error if prediction fails
        raise HTTPException(status_code=422, detail=str(e))

@app.post("/retrain")
async def retrain_model():
    from train_from_db import train_model_from_db
    try:
        X, y = train_model_from_db()
        accuracy = knn_service.train(X, y)
        return {"message": "Modelo treinado com sucesso!", "accuracy": accuracy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao treinar modelo: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
