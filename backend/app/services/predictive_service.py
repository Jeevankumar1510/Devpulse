from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.cluster import KMeans
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import MLTrainRequest, MLTrainResponse

class PredictiveService:
    @staticmethod
    def train_model(req: MLTrainRequest, dataset: Dataset) -> MLTrainResponse:
        df = DatasetService.load_dataframe(dataset)
        task = req.task_type.lower()
        algo = req.algorithm.lower()

        # Validate feature columns
        features = [f for f in req.feature_columns if f in df.columns]
        if not features:
            raise ValueError("At least one valid feature column must be specified.")

        # 1. Clustering (Unsupervised)
        if task == "clustering":
            clean_df = df[features].dropna()
            if len(clean_df) < 5:
                raise ValueError("Insufficient non-null records for clustering.")
            
            n_clusters = int(req.hyperparameters.get("n_clusters", 3)) if req.hyperparameters else 3
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
            clusters = kmeans.fit_predict(clean_df)
            clean_df["assigned_cluster"] = clusters

            cluster_summary = []
            for c_id in range(n_clusters):
                subset = clean_df[clean_df["assigned_cluster"] == c_id]
                cluster_summary.append({
                    "cluster_id": c_id,
                    "record_count": int(len(subset)),
                    "percentage": round(len(subset) / len(clean_df) * 100, 1)
                })

            sample = clean_df.head(15).to_dict(orient="records")
            return MLTrainResponse(
                task_type="Clustering",
                algorithm=f"K-Means (k={n_clusters})",
                train_size=len(clean_df),
                test_size=0,
                metrics={
                    "inertia": round(float(kmeans.inertia_), 2),
                    "clusters": cluster_summary
                },
                predictions_sample=sample
            )

        # 2. Anomaly Detection (Unsupervised)
        if task == "anomaly_detection":
            clean_df = df[features].dropna()
            contamination = float(req.hyperparameters.get("contamination", 0.05)) if req.hyperparameters else 0.05
            iso = IsolationForest(contamination=contamination, random_state=42)
            preds = iso.fit_predict(clean_df)
            scores = iso.decision_function(clean_df)

            clean_df["is_anomaly"] = np.where(preds == -1, True, False)
            clean_df["anomaly_score"] = np.round(scores, 3)

            anom_count = int((clean_df["is_anomaly"] == True).sum())
            sample = clean_df.sort_values(by="anomaly_score").head(15).to_dict(orient="records")

            return MLTrainResponse(
                task_type="Anomaly Detection",
                algorithm="Isolation Forest",
                train_size=len(clean_df),
                test_size=0,
                metrics={
                    "total_analyzed": len(clean_df),
                    "anomalies_detected": anom_count,
                    "contamination_pct": round(anom_count / len(clean_df) * 100, 2)
                },
                predictions_sample=sample
            )

        # 3. Time-Series Forecasting
        if task == "time_series":
            target = req.target_column or features[0]
            series = df[target].dropna().values
            if len(series) < 10:
                raise ValueError("Time series requires at least 10 historical observation points.")

            horizon = 12
            # Simple exponential smoothing / moving trend projection
            alpha = 0.3
            smoothed = [series[0]]
            for val in series[1:]:
                smoothed.append(alpha * val + (1 - alpha) * smoothed[-1])

            trend = (smoothed[-1] - smoothed[0]) / len(smoothed)
            last_val = smoothed[-1]
            forecast = []
            for i in range(1, horizon + 1):
                proj = last_val + trend * i
                forecast.append({
                    "period": f"T+{i}",
                    "forecast": round(float(proj), 2),
                    "ci_lower": round(float(proj - 1.96 * np.std(series) * 0.5), 2),
                    "ci_upper": round(float(proj + 1.96 * np.std(series) * 0.5), 2)
                })

            return MLTrainResponse(
                task_type="Time-Series Forecasting",
                algorithm="Exponential Trend Projection",
                train_size=len(series),
                test_size=horizon,
                metrics={
                    "historical_mean": round(float(np.mean(series)), 2),
                    "historical_std": round(float(np.std(series)), 2),
                    "projected_trend": "Upward" if trend > 0 else "Downward"
                },
                predictions_sample=forecast
            )

        # Supervised tasks (Regression or Classification)
        if not req.target_column or req.target_column not in df.columns:
            raise ValueError(f"Target column '{req.target_column}' is required for supervised learning.")

        valid_df = df[features + [req.target_column]].dropna()
        if len(valid_df) < 10:
            raise ValueError("Insufficient non-null data for model training.")

        X = valid_df[features]
        # One-hot encode string features
        X = pd.get_dummies(X, drop_first=True)
        encoded_feature_names = list(X.columns)

        y = valid_df[req.target_column]

        # 4. Supervised Regression
        if task == "regression":
            y = pd.to_numeric(y, errors="coerce")
            valid_idx = ~y.isnull()
            X = X[valid_idx]
            y = y[valid_idx]

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=req.test_size or 0.2, random_state=42)

            if algo == "random_forest":
                model = RandomForestRegressor(n_estimators=50, random_state=42)
                model_name = "Random Forest Regressor"
            else:
                model = LinearRegression()
                model_name = "Ordinary Least Squares (OLS) Linear Regression"

            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            mse = float(mean_squared_error(y_test, y_pred))
            rmse = float(np.sqrt(mse))
            mae = float(mean_absolute_error(y_test, y_pred))
            r2 = float(r2_score(y_test, y_pred))

            # Feature Importance
            feature_imp = []
            if hasattr(model, "feature_importances_"):
                for name, imp in zip(encoded_feature_names, model.feature_importances_):
                    feature_imp.append({"feature": name, "importance": round(float(imp), 4)})
            elif hasattr(model, "coef_"):
                for name, coef in zip(encoded_feature_names, model.coef_):
                    feature_imp.append({"feature": name, "importance": round(float(abs(coef)), 4)})
            feature_imp.sort(key=lambda x: x["importance"], reverse=True)

            # Sample predictions comparison
            samples = []
            for act, pred in zip(y_test.values[:10], y_pred[:10]):
                samples.append({
                    "actual": round(float(act), 2),
                    "predicted": round(float(pred), 2),
                    "residual": round(float(act - pred), 2)
                })

            return MLTrainResponse(
                task_type="Regression",
                algorithm=model_name,
                train_size=len(X_train),
                test_size=len(X_test),
                metrics={
                    "r_squared": round(r2, 4),
                    "rmse": round(rmse, 2),
                    "mae": round(mae, 2),
                    "mse": round(mse, 2)
                },
                feature_importance=feature_imp[:10],
                predictions_sample=samples
            )

        # 5. Supervised Classification
        elif task == "classification":
            y = y.astype(str)
            classes = list(np.unique(y))
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=req.test_size or 0.2, random_state=42)

            if algo == "random_forest":
                model = RandomForestClassifier(n_estimators=50, random_state=42)
                model_name = "Random Forest Classifier"
            else:
                model = LogisticRegression(max_iter=500)
                model_name = "Logistic Regression Classifier"

            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
            rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

            cm = confusion_matrix(y_test, y_pred, labels=classes)
            cm_dict = {
                "labels": [str(c) for c in classes],
                "matrix": cm.tolist()
            }

            feature_imp = []
            if hasattr(model, "feature_importances_"):
                for name, imp in zip(encoded_feature_names, model.feature_importances_):
                    feature_imp.append({"feature": name, "importance": round(float(imp), 4)})
            feature_imp.sort(key=lambda x: x["importance"], reverse=True)

            samples = []
            for act, pred in zip(y_test.values[:10], y_pred[:10]):
                samples.append({
                    "actual": str(act),
                    "predicted": str(pred),
                    "matched": bool(act == pred)
                })

            return MLTrainResponse(
                task_type="Classification",
                algorithm=model_name,
                train_size=len(X_train),
                test_size=len(X_test),
                metrics={
                    "accuracy": round(acc, 4),
                    "precision": round(prec, 4),
                    "recall": round(rec, 4),
                    "f1_score": round(f1, 4)
                },
                feature_importance=feature_imp[:10] if feature_imp else None,
                confusion_matrix=cm_dict,
                predictions_sample=samples
            )

        else:
            raise ValueError(f"Unsupported task type: {task}")
