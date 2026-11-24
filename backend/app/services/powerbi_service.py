import os
from typing import Dict, Any, List
import pandas as pd
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService

class PowerBIService:
    @staticmethod
    def get_star_schema_model() -> Dict[str, Any]:
        """Defines a production-grade Star Schema dimensional model for Engineering & Quality Intelligence."""
        return {
            "model_name": "DevPulse_Enterprise_Semantic_Model",
            "fact_tables": [
                {
                    "name": "FactPullRequests",
                    "description": "Granular fact records of pull requests and code review velocity.",
                    "primary_key": "pr_id",
                    "foreign_keys": [
                        {"column": "date_key", "references": "DimDate.date_key"},
                        {"column": "repo_id", "references": "DimRepository.repo_id"},
                        {"column": "author_id", "references": "DimDeveloper.developer_id"}
                    ],
                    "measures": ["lead_time_hours", "review_turnaround_hours", "lines_added", "lines_deleted", "review_comments"]
                },
                {
                    "name": "FactDeployments",
                    "description": "Production release events used for DORA calculations.",
                    "primary_key": "deployment_id",
                    "foreign_keys": [
                        {"column": "date_key", "references": "DimDate.date_key"},
                        {"column": "repo_id", "references": "DimRepository.repo_id"}
                    ],
                    "measures": ["lead_time_hours", "time_to_restore_hours", "is_failure"]
                }
            ],
            "dimension_tables": [
                {
                    "name": "DimDate",
                    "description": "Standard corporate date calendar dimension.",
                    "columns": ["date_key", "date", "year", "quarter", "month", "month_name", "week_of_year", "day_of_week", "is_weekend"]
                },
                {
                    "name": "DimRepository",
                    "description": "Software repository and service taxonomy.",
                    "columns": ["repo_id", "repo_name", "primary_language", "architecture_tier", "owner_team"]
                },
                {
                    "name": "DimDeveloper",
                    "description": "Engineering team and role taxonomy (anonymized for privacy).",
                    "columns": ["developer_id", "seniority_role", "squad_name", "timezone"]
                }
            ],
            "relationships": [
                {"from_table": "FactPullRequests", "from_col": "date_key", "to_table": "DimDate", "to_col": "date_key", "cardinality": "Many-to-One"},
                {"from_table": "FactPullRequests", "from_col": "repo_id", "to_table": "DimRepository", "to_col": "repo_id", "cardinality": "Many-to-One"},
                {"from_table": "FactDeployments", "from_col": "date_key", "to_table": "DimDate", "to_col": "date_key", "cardinality": "Many-to-One"}
            ]
        }

    @staticmethod
    def get_dax_measures() -> List[Dict[str, Any]]:
        """Curated DAX measures for Power BI Desktop."""
        return [
            {
                "name": "Average PR Lead Time (Hours)",
                "category": "Engineering Velocity",
                "dax": "Average PR Lead Time = \nAVERAGEX(FactPullRequests, FactPullRequests[lead_time_hours])",
                "format": "Decimal (1 decimal)",
                "description": "Calculates the average elapsed hours from pull request creation to final merge."
            },
            {
                "name": "Median Review Turnaround (Hours)",
                "category": "Code Review",
                "dax": "Median Review Turnaround = \nMEDIANX(FactPullRequests, FactPullRequests[review_turnaround_hours])",
                "format": "Decimal (1 decimal)",
                "description": "Robust median measurement of time elapsed before first review feedback."
            },
            {
                "name": "Change Failure Rate (DORA)",
                "category": "DORA Metrics",
                "dax": "Change Failure Rate = \nDIVIDE(\n    CALCULATE(COUNTROWS(FactDeployments), FactDeployments[is_failure] = 1),\n    COUNTROWS(FactDeployments),\n    0\n)",
                "format": "Percentage (1 decimal)",
                "description": "Percentage of deployments to production that fail or require immediate rollback."
            },
            {
                "name": "Mean Time to Restore (MTTR)",
                "category": "DORA Metrics",
                "dax": "MTTR (Hours) = \nAVERAGEX(\n    FILTER(FactDeployments, FactDeployments[is_failure] = 1),\n    FactDeployments[time_to_restore_hours]\n)",
                "format": "Decimal (1 decimal)",
                "description": "Average hours required to recover service health following a failed release."
            },
            {
                "name": "Deployment Velocity (Monthly)",
                "category": "DORA Metrics",
                "dax": "Monthly Deployments = \nCALCULATE(\n    COUNTROWS(FactDeployments),\n    DATESMTD(DimDate[date])\n)",
                "format": "Whole Number",
                "description": "Month-to-date deployment count across all production microservices."
            },
            {
                "name": "PR Revert Ratio",
                "category": "Software Quality",
                "dax": "PR Revert Ratio = \nDIVIDE(\n    CALCULATE(COUNTROWS(FactPullRequests), FactPullRequests[is_reverted] = 1),\n    COUNTROWS(FactPullRequests),\n    0\n)",
                "format": "Percentage (1 decimal)",
                "description": "Ratio of merged pull requests that subsequently had to be reverted."
            }
        ]
