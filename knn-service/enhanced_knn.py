import os
import joblib
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import (
    GridSearchCV,
    cross_val_score,
    StratifiedKFold,
    train_test_split
)
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import BaggingClassifier
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, f_classif
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedKNNService:
    """
    Enhanced KNN Service with advanced features:
    - Hyperparameter tuning with Grid Search
    - Cross-validation
    - Feature scaling and selection
    - Multiple evaluation metrics
    - Ensemble methods
    - Model explainability
    """

    def __init__(
        self,
        model_path: str = "enhanced_knn_model.joblib",
        scaler_path: str = "knn_scaler.joblib",
        feature_selector_path: str = "knn_feature_selector.joblib"
    ):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.feature_selector_path = feature_selector_path

        self.model = None
        self.scaler = None
        self.feature_selector = None
        self.best_params = None
        self.cv_results = None

        # Default hyperparameters for grid search
        self.param_grid = {
            'n_neighbors': [3, 5, 7, 9, 11, 13, 15],
            'weights': ['uniform', 'distance'],
            'metric': ['euclidean', 'manhattan', 'minkowski'],
            'p': [1, 2],  # Only used with minkowski
            'algorithm': ['auto', 'ball_tree', 'kd_tree', 'brute']
        }

    def preprocess_data(
        self,
        X: np.ndarray,
        y: Optional[np.ndarray] = None,
        fit: bool = True
    ) -> np.ndarray:
        """
        Preprocess data with scaling and feature selection
        """
        if fit:
            # Initialize scalers and selectors
            self.scaler = StandardScaler()
            self.feature_selector = SelectKBest(score_func=f_classif, k='all')

            # Fit and transform
            X_scaled = self.scaler.fit_transform(X)

            if y is not None:
                X_selected = self.feature_selector.fit_transform(X_scaled, y)
            else:
                X_selected = self.feature_selector.fit_transform(X_scaled, np.zeros(X.shape[0]))

            # Save preprocessing objects
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.feature_selector, self.feature_selector_path)

        else:
            # Load and transform
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
            if os.path.exists(self.feature_selector_path):
                self.feature_selector = joblib.load(self.feature_selector_path)

            if self.scaler:
                X_scaled = self.scaler.transform(X)
                X_selected = self.feature_selector.transform(X_scaled) if self.feature_selector else X_scaled
            else:
                X_selected = X

        return X_selected

    def hyperparameter_tuning(
        self,
        X: np.ndarray,
        y: np.ndarray,
        cv: int = 5,
        scoring: str = 'f1_macro'
    ) -> Dict[str, Any]:
        """
        Perform grid search for hyperparameter optimization
        """
        logger.info("Starting hyperparameter tuning...")

        # Create base model
        base_model = KNeighborsClassifier()

        # Stratified K-Fold for imbalanced datasets
        cv_strategy = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)

        # Grid search
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=self.param_grid,
            cv=cv_strategy,
            scoring=scoring,
            n_jobs=-1,
            verbose=1,
            return_train_score=True
        )

        # Fit grid search
        grid_search.fit(X, y)

        self.best_params = grid_search.best_params_
        self.cv_results = grid_search.cv_results_

        logger.info(f"Best parameters: {self.best_params}")
        logger.info(f"Best cross-validation score: {grid_search.best_score_:.4f}")

        return {
            'best_params': self.best_params,
            'best_score': grid_search.best_score_,
            'cv_results': self.cv_results,
            'best_estimator': grid_search.best_estimator_
        }

    def train_enhanced(
        self,
        X: np.ndarray,
        y: np.ndarray,
        use_grid_search: bool = True,
        use_ensemble: bool = False,
        cv_folds: int = 5
    ) -> Dict[str, Any]:
        """
        Enhanced training with preprocessing, hyperparameter tuning, and evaluation
        """
        logger.info("Starting enhanced KNN training...")

        # Preprocess data
        X_processed = self.preprocess_data(X, y, fit=True)

        # Split data for final evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42, stratify=y
        )

        # Hyperparameter tuning
        if use_grid_search:
            tuning_results = self.hyperparameter_tuning(X_train, y_train, cv=cv_folds)

            # Create best model
            if use_ensemble:
                # Use bagging ensemble with best parameters
                base_estimator = KNeighborsClassifier(**tuning_results['best_params'])
                self.model = BaggingClassifier(
                    base_estimator=base_estimator,
                    n_estimators=10,
                    random_state=42
                )
            else:
                self.model = tuning_results['best_estimator']
        else:
            # Use default parameters
            self.model = KNeighborsClassifier(n_neighbors=5)
            if use_ensemble:
                self.model = BaggingClassifier(
                    base_estimator=self.model,
                    n_estimators=10,
                    random_state=42
                )

        # Train the model
        self.model.fit(X_train, y_train)

        # Evaluate on test set
        evaluation_results = self.evaluate_detailed(X_test, y_test)

        # Save model
        self.save_model()

        logger.info("Enhanced training completed successfully")

        return {
            'model': self.model,
            'evaluation': evaluation_results,
            'best_params': getattr(self, 'best_params', None),
            'preprocessing': {
                'scaler': self.scaler,
                'feature_selector': self.feature_selector
            }
        }

    def evaluate_detailed(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Comprehensive model evaluation with multiple metrics
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Get predictions
        y_pred = self.model.predict(X)

        # Get prediction probabilities if available
        try:
            y_pred_proba = self.model.predict_proba(X)
            has_proba = True
        except:
            has_proba = False

        # Calculate metrics
        results = {
            'accuracy': accuracy_score(y, y_pred),
            'precision_macro': precision_score(y, y_pred, average='macro', zero_division=0),
            'precision_micro': precision_score(y, y_pred, average='micro', zero_division=0),
            'recall_macro': recall_score(y, y_pred, average='macro', zero_division=0),
            'recall_micro': recall_score(y, y_pred, average='micro', zero_division=0),
            'f1_macro': f1_score(y, y_pred, average='macro', zero_division=0),
            'f1_micro': f1_score(y, y_pred, average='micro', zero_division=0),
            'classification_report': classification_report(y, y_pred, zero_division=0),
            'confusion_matrix': confusion_matrix(y, y_pred).tolist(),
        }

        # Add AUC if probabilities available and binary classification
        if has_proba and len(np.unique(y)) == 2:
            try:
                results['auc'] = roc_auc_score(y, y_pred_proba[:, 1])
            except:
                pass

        return results

    def cross_validate(
        self,
        X: np.ndarray,
        y: np.ndarray,
        cv: int = 5,
        scoring: List[str] = ['accuracy', 'precision_macro', 'recall_macro', 'f1_macro']
    ) -> Dict[str, Any]:
        """
        Perform cross-validation with multiple scoring metrics
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        cv_results = {}

        for metric in scoring:
            try:
                scores = cross_val_score(
                    self.model, X, y, cv=cv, scoring=metric
                )
                cv_results[metric] = {
                    'mean': scores.mean(),
                    'std': scores.std(),
                    'scores': scores.tolist()
                }
            except Exception as e:
                logger.warning(f"Could not calculate {metric}: {e}")

        return cv_results

    def predict_with_confidence(
        self,
        X: np.ndarray,
        confidence_threshold: float = 0.8
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Make predictions with confidence scores
        Returns: (predictions, probabilities, high_confidence_mask)
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Preprocess input
        X_processed = self.preprocess_data(X, fit=False)

        # Get predictions
        predictions = self.model.predict(X_processed)

        # Get probabilities if available
        try:
            probabilities = self.model.predict_proba(X_processed)
            max_probs = np.max(probabilities, axis=1)
            high_confidence = max_probs >= confidence_threshold
        except:
            # Fallback for models without predict_proba
            probabilities = np.full((len(predictions), len(np.unique(predictions))), 0.5)
            high_confidence = np.full(len(predictions), True)

        return predictions, probabilities, high_confidence

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Standard prediction method (backward compatibility)
        """
        if self.model is None:
            self.load_model()

        X_processed = self.preprocess_data(X, fit=False)
        return self.model.predict(X_processed)

    def save_model(self):
        """Save the trained model and preprocessing objects"""
        if self.model:
            joblib.dump(self.model, self.model_path)
            logger.info(f"Model saved to {self.model_path}")

    def load_model(self):
        """Load the trained model and preprocessing objects"""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)

            # Load preprocessing objects
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
            if os.path.exists(self.feature_selector_path):
                self.feature_selector = joblib.load(self.feature_selector_path)

            logger.info(f"Model loaded from {self.model_path}")
        else:
            raise FileNotFoundError("Enhanced KNN model not found. Train the model first.")

    def get_feature_importance(self) -> Optional[Dict[str, float]]:
        """
        Get feature importance scores (if available)
        """
        if self.feature_selector:
            scores = self.feature_selector.scores_
            feature_names = [f"feature_{i}" for i in range(len(scores))]

            # Normalize scores
            max_score = np.max(scores)
            if max_score > 0:
                normalized_scores = scores / max_score
            else:
                normalized_scores = scores

            return dict(zip(feature_names, normalized_scores))
        return None

    def plot_cv_results(self, save_path: Optional[str] = None):
        """
        Plot cross-validation results from grid search
        """
        if self.cv_results is None:
            logger.warning("No CV results available. Run hyperparameter_tuning first.")
            return

        # Create plots for different metrics
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Grid Search Cross-Validation Results')

        metrics = ['mean_test_score', 'mean_train_score', 'std_test_score']

        for i, metric in enumerate(metrics[:3]):
            ax = axes[i // 2, i % 2]
            scores = self.cv_results[f'{metric}']
            ax.plot(scores, 'o-')
            ax.set_title(f'{metric.replace("_", " ").title()}')
            ax.set_xlabel('Parameter Combination')
            ax.set_ylabel('Score')
            ax.grid(True)

        # Plot parameter combinations
        ax = axes[1, 1]
        params = [f"k={p['n_neighbors']}, w={p['weights'][:3]}" for p in self.cv_results['params']]
        scores = self.cv_results['mean_test_score']
        ax.barh(range(len(params)), scores)
        ax.set_yticks(range(len(params)))
        ax.set_yticklabels(params[:10])  # Show first 10
        ax.set_title('Top Parameter Combinations')
        ax.set_xlabel('Mean CV Score')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"CV results plot saved to {save_path}")
        else:
            plt.show()

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get comprehensive information about the trained model
        """
        if self.model is None:
            return {"status": "not_trained"}

        info = {
            "status": "trained",
            "model_type": type(self.model).__name__,
            "best_params": self.best_params,
            "has_scaler": self.scaler is not None,
            "has_feature_selector": self.feature_selector is not None,
        }

        # Add ensemble info if applicable
        if hasattr(self.model, 'base_estimator_'):
            info["ensemble"] = True
            info["n_estimators"] = self.model.n_estimators
            info["base_estimator_params"] = self.model.base_estimator_.get_params()
        else:
            info["ensemble"] = False

        # Add feature importance if available
        feature_importance = self.get_feature_importance()
        if feature_importance:
            info["feature_importance"] = feature_importance

        return info

# Convenience function for quick usage
def create_enhanced_knn(
    X: np.ndarray,
    y: np.ndarray,
    use_grid_search: bool = True,
    use_ensemble: bool = False
) -> EnhancedKNNService:
    """
    Factory function to create and train an enhanced KNN model
    """
    service = EnhancedKNNService()
    service.train_enhanced(X, y, use_grid_search, use_ensemble)

    return service

# Example usage and testing
if __name__ == "__main__":
    # Generate sample data for testing
    from sklearn.datasets import make_classification

    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_informative=10,
        n_redundant=5,
        n_clusters_per_class=1,
        random_state=42
    )

    # Create and train enhanced KNN
    knn_service = EnhancedKNNService()
    results = knn_service.train_enhanced(X, y, use_grid_search=True, use_ensemble=True)

    print("Training Results:")
    print(f"Best Parameters: {results['best_params']}")
    print(f"Test Accuracy: {results['evaluation']['accuracy']:.4f}")
    print(f"Test F1-Score: {results['evaluation']['f1_macro']:.4f}")

    # Test predictions
    test_predictions = knn_service.predict(X[:10])
    print(f"Sample predictions: {test_predictions}")

    print("\nModel Info:")
    print(knn_service.get_model_info())
