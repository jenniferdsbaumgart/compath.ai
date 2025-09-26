from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import uvicorn
import asyncio
import logging
from datetime import datetime
from enhanced_knn import EnhancedKNNService
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Enhanced KNN Niche Recommendation Service",
    description="Advanced machine learning service for entrepreneurial niche recommendations",
    version="2.0.0"
)

# CORS middleware - Secure configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://compath.ai",
        "https://www.compath.ai"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global enhanced KNN service instance
enhanced_knn = EnhancedKNNService(
    model_path="enhanced_knn_model_v2.joblib",
    scaler_path="enhanced_knn_scaler_v2.joblib",
    feature_selector_path="enhanced_knn_feature_selector_v2.joblib"
)

class FeatureInput(BaseModel):
    features: List[float] = Field(..., description="List of numerical features for prediction")
    confidence_threshold: Optional[float] = Field(0.6, description="Confidence threshold for predictions (0.0-1.0)")

class PredictionResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    confidence_scores: List[float]

class TrainingRequest(BaseModel):
    use_grid_search: bool = Field(True, description="Whether to perform hyperparameter tuning")
    use_ensemble: bool = Field(False, description="Whether to use ensemble methods")
    cv_folds: int = Field(5, description="Number of cross-validation folds")

class ModelInfo(BaseModel):
    status: str
    model_type: Optional[str]
    best_params: Optional[Dict[str, Any]]
    has_scaler: bool
    has_feature_selector: bool
    ensemble: bool
    feature_importance: Optional[Dict[str, float]]

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Enhanced KNN Niche Recommendation Service",
        "version": "2.0.0",
        "status": "healthy",
        "model_loaded": enhanced_knn.model is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        model_info = enhanced_knn.get_model_info()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "model": model_info,
            "service": "enhanced-knn"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_niche(input_data: FeatureInput):
    """
    Get niche recommendations using enhanced KNN with confidence scores
    """
    try:
        # Validate input
        if not input_data.features:
            raise HTTPException(status_code=400, detail="Features list cannot be empty")

        if len(input_data.features) < 2:
            raise HTTPException(status_code=400, detail="At least 2 features required")

        # Convert to numpy array
        features = np.array(input_data.features, dtype=float).reshape(1, -1)

        # Get predictions with confidence
        predictions, probabilities, high_confidence = enhanced_knn.predict_with_confidence(
            features,
            input_data.confidence_threshold
        )

        # Prepare recommendations
        recommendations = []
        confidence_scores = []

        for i, (pred, prob_row) in enumerate(zip(predictions, probabilities)):
            # Get top predictions
            top_indices = np.argsort(prob_row)[-5:][::-1]

            for idx in top_indices:
                confidence = float(prob_row[idx])
                recommendations.append({
                    "niche": str(enhanced_knn.model.classes_[idx]),
                    "probability": confidence,
                    "rank": len(recommendations) + 1
                })
                confidence_scores.append(confidence)

        # Metadata
        metadata = {
            "input_features_count": len(input_data.features),
            "confidence_threshold": input_data.confidence_threshold,
            "high_confidence_predictions": bool(high_confidence[0]),
            "model_version": "enhanced_v2",
            "timestamp": datetime.now().isoformat()
        }

        logger.info(f"Prediction completed for {len(input_data.features)} features")

        return PredictionResponse(
            recommendations=recommendations,
            metadata=metadata,
            confidence_scores=confidence_scores
        )

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/retrain")
async def retrain_model(
    background_tasks: BackgroundTasks,
    training_config: TrainingRequest = None
):
    """
    Retrain the enhanced KNN model with latest data
    """
    if training_config is None:
        training_config = TrainingRequest()

    try:
        # Import training function
        from train_from_db import train_model_from_db

        # Add retraining to background tasks
        background_tasks.add_task(
            retrain_model_background,
            training_config.use_grid_search,
            training_config.use_ensemble,
            training_config.cv_folds
        )

        return {
            "message": "Model retraining started in background",
            "config": training_config.dict(),
            "status": "training"
        }

    except Exception as e:
        logger.error(f"Retraining request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

def retrain_model_background(use_grid_search: bool, use_ensemble: bool, cv_folds: int):
    """Background task for model retraining"""
    try:
        logger.info("Starting background model retraining...")

        # Get training data
        from train_from_db import train_model_from_db
        X, y = train_model_from_db()

        if len(X) == 0 or len(y) == 0:
            logger.error("No training data available")
            return

        logger.info(f"Training with {len(X)} samples and {X.shape[1]} features")

        # Train enhanced model
        training_results = enhanced_knn.train_enhanced(
            X, y,
            use_grid_search=use_grid_search,
            use_ensemble=use_ensemble,
            cv_folds=cv_folds
        )

        # Log results
        logger.info("Model retraining completed successfully")
        logger.info(f"Best parameters: {training_results.get('best_params')}")
        logger.info(f"Accuracy: {training_results['evaluation']['accuracy']:.4f}")
        logger.info(f"F1-Score: {training_results['evaluation']['f1_macro']:.4f}")

    except Exception as e:
        logger.error(f"Background retraining failed: {str(e)}")

@app.post("/retrain/sync")
async def retrain_model_sync(training_config: TrainingRequest = None):
    """
    Retrain the model synchronously (not recommended for production)
    """
    if training_config is None:
        training_config = TrainingRequest()

    try:
        # Get training data
        from train_from_db import train_model_from_db
        X, y = train_model_from_db()

        if len(X) == 0 or len(y) == 0:
            raise HTTPException(status_code=400, detail="No training data available")

        # Train enhanced model
        training_results = enhanced_knn.train_enhanced(
            X, y,
            use_grid_search=training_config.use_grid_search,
            use_ensemble=training_config.use_ensemble,
            cv_folds=training_config.cv_folds
        )

        return {
            "message": "Model retrained successfully",
            "results": {
                "accuracy": training_results["evaluation"]["accuracy"],
                "f1_macro": training_results["evaluation"]["f1_macro"],
                "best_params": training_results.get("best_params"),
                "training_time": "completed"
            }
        }

    except Exception as e:
        logger.error(f"Synchronous retraining failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    """Get detailed information about the current model"""
    try:
        info = enhanced_knn.get_model_info()
        return ModelInfo(**info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get model info: {str(e)}")

@app.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance scores"""
    try:
        importance = enhanced_knn.get_feature_importance()
        if importance:
            # Sort by importance
            sorted_importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
            return {
                "feature_importance": sorted_importance,
                "top_features": list(sorted_importance.keys())[:10]
            }
        else:
            raise HTTPException(status_code=404, detail="Feature importance not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get feature importance: {str(e)}")

@app.get("/performance")
async def get_model_performance():
    """Get model performance metrics"""
    try:
        # This would require storing evaluation results
        # For now, return basic model info
        info = enhanced_knn.get_model_info()
        return {
            "model_info": info,
            "note": "Detailed performance metrics available after evaluation"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get performance metrics: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        enhanced_knn.load_model()
        logger.info("Enhanced KNN model loaded successfully on startup")
    except FileNotFoundError:
        logger.warning("No pre-trained model found. Use /retrain to train a new model.")
    except Exception as e:
        logger.error(f"Error loading model on startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Enhanced KNN service shutting down")

if __name__ == "__main__":
    logger.info("Starting Enhanced KNN Service v2.0.0")
    logger.info("Features:")
    logger.info("  ✓ Hyperparameter tuning with Grid Search")
    logger.info("  ✓ Cross-validation with multiple metrics")
    logger.info("  ✓ Feature scaling and selection")
    logger.info("  ✓ Ensemble methods support")
    logger.info("  ✓ Confidence score predictions")
    logger.info("  ✓ Background model retraining")
    logger.info("  ✓ Comprehensive API endpoints")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,  # Different port from original service
        log_level="info"
    )
