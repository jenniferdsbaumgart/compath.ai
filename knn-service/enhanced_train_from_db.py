#!/usr/bin/env python3
"""
Enhanced training script for KNN model using data from MongoDB
Includes advanced preprocessing, validation, and model evaluation
"""

import os
import sys
import logging
from datetime import datetime
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_knn import EnhancedKNNService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnhancedKNNTrainer:
    """Enhanced trainer for KNN model with MongoDB integration"""

    def __init__(self, mongo_uri: str = None):
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/compath')
        self.client = None
        self.db = None
        self.collection = None

    def connect_db(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client['compath']
            self.collection = self.db['reports']

            # Test connection
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")

        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def disconnect_db(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def extract_features_from_report(self, report: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract numerical features from a report document
        """
        features = {}

        try:
            # Basic text features
            title = report.get('title', '')
            search_query = report.get('searchQuery', '')
            description = report.get('report', {}).get('description', '')

            # Length features
            features['title_length'] = len(str(title))
            features['query_length'] = len(str(search_query))
            features['description_length'] = len(str(description))

            # Content analysis features
            full_text = f"{title} {search_query} {description}".lower()

            # Keyword density features
            business_keywords = ['empresa', 'negócio', 'mercado', 'cliente', 'produto', 'serviço']
            tech_keywords = ['tecnologia', 'digital', 'software', 'app', 'web']
            finance_keywords = ['financeiro', 'investimento', 'lucro', 'custo']

            features['business_keyword_density'] = sum(1 for kw in business_keywords if kw in full_text)
            features['tech_keyword_density'] = sum(1 for kw in tech_keywords if kw in full_text)
            features['finance_keyword_density'] = sum(1 for kw in finance_keywords if kw in full_text)

            # Report structure features
            report_data = report.get('report', {})

            # Opportunities and challenges
            opportunities = report_data.get('opportunities', [])
            challenges = report_data.get('challenges', [])
            recommendations = report_data.get('recommendations', [])

            features['opportunities_count'] = len(opportunities) if isinstance(opportunities, list) else 0
            features['challenges_count'] = len(challenges) if isinstance(challenges, list) else 0
            features['recommendations_count'] = len(recommendations) if isinstance(recommendations, list) else 0

            # Market analysis features
            customer_segments = report_data.get('customerSegments', [])
            key_players = report_data.get('keyPlayers', [])

            features['customer_segments_count'] = len(customer_segments) if isinstance(customer_segments, list) else 0
            features['key_players_count'] = len(key_players) if isinstance(key_players, list) else 0

            # Target audience features
            target_audience = report_data.get('targetAudience', [])
            if isinstance(target_audience, list):
                features['target_audience_size'] = len(target_audience)
                features['target_audience_diversity'] = len(set(str(ta).lower() for ta in target_audience))
            else:
                features['target_audience_size'] = 0
                features['target_audience_diversity'] = 0

            # Competitive analysis
            strengths = report_data.get('strengths', [])
            weaknesses = report_data.get('weaknesses', [])

            features['strengths_count'] = len(strengths) if isinstance(strengths, list) else 0
            features['weaknesses_count'] = len(weaknesses) if isinstance(weaknesses, list) else 0

            # Data quality score
            data_quality = report_data.get('dataQuality', 'no_evidence')
            features['data_quality_score'] = 1 if data_quality == 'verified' else 0

            # Sources count
            sources = report_data.get('sources', [])
            features['sources_count'] = len(sources) if isinstance(sources, list) else 0

        except Exception as e:
            logger.warning(f"Error extracting features from report: {e}")
            # Return default features
            features = {f'feature_{i}': 0 for i in range(20)}

        return features

    def collect_training_data(self, limit: int = None) -> Tuple[np.ndarray, np.ndarray, list]:
        """
        Collect and preprocess training data from MongoDB
        """
        logger.info("Collecting training data from MongoDB...")

        try:
            # Query reports with labels (this assumes reports have some classification)
            # In a real scenario, you'd have labeled data or use clustering
            cursor = self.collection.find({})

            if limit:
                cursor = cursor.limit(limit)

            reports = list(cursor)
            logger.info(f"Found {len(reports)} reports in database")

            if len(reports) == 0:
                raise ValueError("No reports found in database")

            # Extract features and create synthetic labels for demonstration
            # In production, you'd have real labels from user feedback or expert classification
            feature_data = []
            labels = []

            for i, report in enumerate(reports):
                features = self.extract_features_from_report(report)

                # Convert features to numerical values
                feature_vector = []
                for key in sorted(features.keys()):
                    value = features[key]
                    if isinstance(value, (int, float)):
                        feature_vector.append(float(value))
                    else:
                        # Convert strings to hash-like numerical values
                        feature_vector.append(hash(str(value)) % 1000 / 1000.0)

                feature_data.append(feature_vector)

                # Create synthetic labels based on content analysis
                # This is a simplified approach - in production use real labels
                if features.get('tech_keyword_density', 0) > features.get('business_keyword_density', 0):
                    labels.append('technology')
                elif features.get('finance_keyword_density', 0) > 1:
                    labels.append('finance')
                elif features.get('customer_segments_count', 0) > 2:
                    labels.append('b2b')
                else:
                    labels.append('general')

            # Convert to numpy arrays
            X = np.array(feature_data)
            y = np.array(labels)

            # Get unique labels for reference
            unique_labels = list(set(labels))

            logger.info(f"Extracted {X.shape[0]} samples with {X.shape[1]} features")
            logger.info(f"Label distribution: {pd.Series(labels).value_counts().to_dict()}")

            return X, y, unique_labels

        except Exception as e:
            logger.error(f"Error collecting training data: {e}")
            raise

    def validate_data_quality(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Validate data quality and provide statistics
        """
        logger.info("Validating data quality...")

        validation_results = {
            'total_samples': len(X),
            'total_features': X.shape[1],
            'unique_labels': len(np.unique(y)),
            'label_distribution': pd.Series(y).value_counts().to_dict(),
            'missing_values': np.isnan(X).sum(),
            'infinite_values': np.isinf(X).sum(),
            'feature_stats': {}
        }

        # Feature statistics
        for i in range(X.shape[1]):
            feature_values = X[:, i]
            validation_results['feature_stats'][f'feature_{i}'] = {
                'mean': float(np.mean(feature_values)),
                'std': float(np.std(feature_values)),
                'min': float(np.min(feature_values)),
                'max': float(np.max(feature_values)),
                'zeros': int(np.sum(feature_values == 0))
            }

        # Check for data quality issues
        issues = []
        if validation_results['missing_values'] > 0:
            issues.append(f"Found {validation_results['missing_values']} missing values")
        if validation_results['infinite_values'] > 0:
            issues.append(f"Found {validation_results['infinite_values']} infinite values")
        if validation_results['unique_labels'] < 2:
            issues.append("Need at least 2 unique labels for classification")

        validation_results['data_quality_issues'] = issues

        logger.info(f"Data validation completed. Found {len(issues)} issues.")

        return validation_results

    def train_enhanced_model(
        self,
        use_grid_search: bool = True,
        use_ensemble: bool = False,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict[str, Any]:
        """
        Train the enhanced KNN model with comprehensive evaluation
        """
        logger.info("Starting enhanced model training...")

        try:
            # Connect to database
            self.connect_db()

            # Collect training data
            X, y, label_classes = self.collect_training_data()

            # Validate data quality
            data_validation = self.validate_data_quality(X, y)

            if data_validation['data_quality_issues']:
                logger.warning("Data quality issues found:")
                for issue in data_validation['data_quality_issues']:
                    logger.warning(f"  - {issue}")

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )

            logger.info(f"Training set: {X_train.shape[0]} samples")
            logger.info(f"Test set: {X_test.shape[0]} samples")

            # Initialize enhanced KNN
            knn_service = EnhancedKNNService()

            # Train the model
            training_results = knn_service.train_enhanced(
                X_train, y_train,
                use_grid_search=use_grid_search,
                use_ensemble=use_ensemble,
                cv_folds=5
            )

            # Evaluate on test set
            test_evaluation = knn_service.evaluate_detailed(X_test, y_test)

            # Cross-validation on full training set
            cv_results = knn_service.cross_validate(X_train, y_train, cv=5)

            # Compile comprehensive results
            results = {
                'training_timestamp': datetime.now().isoformat(),
                'data_info': {
                    'total_samples': len(X),
                    'training_samples': len(X_train),
                    'test_samples': len(X_test),
                    'features_count': X.shape[1],
                    'label_classes': label_classes,
                    'label_distribution': data_validation['label_distribution']
                },
                'data_validation': data_validation,
                'model_training': {
                    'best_params': training_results.get('best_params'),
                    'training_accuracy': training_results['evaluation']['accuracy'],
                    'training_f1_macro': training_results['evaluation']['f1_macro'],
                    'use_grid_search': use_grid_search,
                    'use_ensemble': use_ensemble
                },
                'test_evaluation': test_evaluation,
                'cross_validation': cv_results,
                'model_info': knn_service.get_model_info(),
                'feature_importance': knn_service.get_feature_importance()
            }

            # Save model
            knn_service.save_model()

            # Generate evaluation plots
            self.generate_evaluation_plots(
                test_evaluation,
                training_results.get('evaluation', {}),
                f"evaluation_plots_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            )

            logger.info("Enhanced model training completed successfully!")
            logger.info(f"Test Accuracy: {test_evaluation['accuracy']:.4f}")
            logger.info(f"Test F1-Score: {test_evaluation['f1_macro']:.4f}")

            return results

        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise
        finally:
            self.disconnect_db()

    def generate_evaluation_plots(self, test_results: Dict, train_results: Dict, filename: str):
        """
        Generate evaluation plots and save to file
        """
        try:
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            fig.suptitle('Enhanced KNN Model Evaluation')

            # Confusion Matrix
            if 'confusion_matrix' in test_results:
                cm = np.array(test_results['confusion_matrix'])
                if cm.shape[0] <= 10:  # Only plot if not too large
                    sns.heatmap(cm, annot=True, fmt='d', ax=axes[0, 0], cmap='Blues')
                    axes[0, 0].set_title('Test Set Confusion Matrix')
                    axes[0, 0].set_xlabel('Predicted')
                    axes[0, 0].set_ylabel('Actual')

            # Metrics Comparison
            metrics = ['accuracy', 'precision_macro', 'recall_macro', 'f1_macro']
            train_scores = [train_results.get(m, 0) for m in metrics]
            test_scores = [test_results.get(m, 0) for m in metrics]

            x = np.arange(len(metrics))
            width = 0.35

            axes[0, 1].bar(x - width/2, train_scores, width, label='Training', alpha=0.8)
            axes[0, 1].bar(x + width/2, test_scores, width, label='Test', alpha=0.8)
            axes[0, 1].set_title('Training vs Test Metrics')
            axes[0, 1].set_xticks(x)
            axes[0, 1].set_xticklabels(metrics, rotation=45)
            axes[0, 1].legend()

            # Classification Report
            if 'classification_report' in test_results:
                # This is a simplified visualization
                axes[1, 0].text(0.1, 0.5, test_results['classification_report'],
                               transform=axes[1, 0].transAxes, fontsize=8,
                               verticalalignment='center', fontfamily='monospace')
                axes[1, 0].set_title('Classification Report')
                axes[1, 0].axis('off')

            # Feature Importance (if available)
            feature_importance = test_results.get('feature_importance')
            if feature_importance and isinstance(feature_importance, dict):
                features = list(feature_importance.keys())[:10]
                scores = [feature_importance[f] for f in features]

                axes[1, 1].barh(features, scores)
                axes[1, 1].set_title('Top 10 Feature Importance')
                axes[1, 1].set_xlabel('Importance Score')

            plt.tight_layout()
            plt.savefig(filename, dpi=300, bbox_inches='tight')
            logger.info(f"Evaluation plots saved to {filename}")
            plt.close()

        except Exception as e:
            logger.warning(f"Could not generate evaluation plots: {e}")

def main():
    """Main training function"""
    logger.info("Starting Enhanced KNN Training Pipeline")
    logger.info("=" * 50)

    trainer = EnhancedKNNTrainer()

    try:
        # Train the model
        results = trainer.train_enhanced_model(
            use_grid_search=True,
            use_ensemble=False,
            test_size=0.2
        )

        # Print summary
        print("\n" + "=" * 50)
        print("ENHANCED KNN TRAINING SUMMARY")
        print("=" * 50)
        print(f"Samples: {results['data_info']['total_samples']}")
        print(f"Features: {results['data_info']['features_count']}")
        print(f"Labels: {results['data_info']['unique_labels']}")
        print(".4f")
        print(".4f")
        print(f"Best Params: {results['model_training']['best_params']}")
        print("=" * 50)

        # Save results to JSON
        import json
        with open('training_results.json', 'w') as f:
            # Convert numpy types to native Python types for JSON serialization
            json_results = json.dumps(results, default=str, indent=2)
            f.write(json_results)

        logger.info("Training results saved to 'training_results.json'")

    except Exception as e:
        logger.error(f"Training pipeline failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
