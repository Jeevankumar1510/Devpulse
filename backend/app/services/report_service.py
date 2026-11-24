from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.engineering_service import EngineeringService
from app.services.bi_service import BIService
from app.models.dataset import Dataset
from app.services.quality_service import QualityService

class ReportService:
    @staticmethod
    def generate_report(report_type: str, db: Session, format: str = "markdown") -> Dict[str, Any]:
        eng_data = EngineeringService.get_engineering_intelligence(db)
        bi_data = BIService.get_business_insights(db)
        
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        if report_type == "engineering_dora":
            title = "DevPulse Engineering Velocity & DORA Intelligence Brief"
            md_content = f"""# {title}
**Generated At:** {now_str}  
**Classification:** {eng_data.dora_classification.tier if eng_data.dora_classification else 'N/A'} (Score: {eng_data.dora_classification.score if eng_data.dora_classification else 'N/A'} / 100)

---

## 1. Executive Summary
{bi_data.executive_summary}

---

## 2. DORA Core Metrics Assessment
> [!NOTE] DORA metrics are strictly evaluated against verified deployment audit records. Individual commit counts are never treated as productivity scores.

| DORA Dimension | Value | Unit | Performance Tier | Target Benchmark |
| :--- | :--- | :--- | :--- | :--- |
| **Deployment Frequency** | {eng_data.dora_metrics['deployment_frequency']['value']} | {eng_data.dora_metrics['deployment_frequency']['unit']} | {eng_data.dora_metrics['deployment_frequency']['rating']} | Daily (>1.0) |
| **Lead Time for Changes** | {eng_data.dora_metrics['lead_time_for_changes']['value']} | {eng_data.dora_metrics['lead_time_for_changes']['unit']} | {eng_data.dora_metrics['lead_time_for_changes']['rating']} | < 24 Hours |
| **Change Failure Rate** | {eng_data.dora_metrics['change_failure_rate']['value']}% | % | {eng_data.dora_metrics['change_failure_rate']['rating']} | < 5.0% |
| **Time to Restore (MTTR)**| {eng_data.dora_metrics['time_to_restore_service']['value']} | {eng_data.dora_metrics['time_to_restore_service']['unit']} | {eng_data.dora_metrics['time_to_restore_service']['rating']} | < 4.0 Hours |

---

## 3. Workflow Bottlenecks & Strategic Recommendations
"""
            for b in eng_data.bottlenecks:
                md_content += f"""
### {b['type']} ({b['severity']} Priority)
- **Metric:** {b['metric']}
- **Impact:** {b['impact']}
- **Action Plan:** {b['recommendation']}
"""

        elif report_type == "quality_audit":
            title = "DevPulse Software Quality & Data Integrity Audit"
            datasets = db.query(Dataset).all()
            md_content = f"""# {title}
**Generated At:** {now_str}  
**Audited Datasets:** {len(datasets)}

---

## 1. Overall Quality Health
- **Organization Health Score:** {bi_data.overall_health_score}%
- **Automated Test Coverage:** {eng_data.test_coverage_pct}%
- **Defect Density:** {eng_data.defect_density_per_kloc} defects / KLOC
- **CI/CD Build Success Rate:** {eng_data.ci_build_success_rate}%

---

## 2. Dataset Quality Scorecards
"""
            for ds in datasets:
                audit = QualityService.audit_dataset_quality(ds)
                md_content += f"""
### Dataset: {ds.name} (Grade: {audit['quality_grade']}, Score: {audit['overall_score']} / 100)
- **Completeness:** {audit['dimension_scores']['completeness']}%
- **Uniqueness:** {audit['dimension_scores']['uniqueness']}%
- **Statistical Validity:** {audit['dimension_scores']['validity']}%
- **Total Rows / Columns:** {audit['summary_metrics']['total_rows']} rows / {audit['summary_metrics']['total_columns']} columns
- **Synthetic Origin Disclosed:** {'Yes - ' + str(ds.synthetic_disclosure) if ds.is_synthetic else 'No (Authentic / User Uploaded)'}
"""

        else: # general_overview
            title = "DevPulse Comprehensive BI & Platform Overview"
            md_content = f"""# {title}
**Generated At:** {now_str}  
**Overall System Health Score:** {bi_data.overall_health_score}%

---

## Executive Summary
{bi_data.executive_summary}

---

## Prioritized Strategic Recommendations
"""
            for r in bi_data.actionable_recommendations:
                md_content += f"- **[{r['priority']}] {r['area']}**: {r['action']} *(Impact: {r['expected_impact']})*\n"

        return {
            "title": title,
            "report_type": report_type,
            "format": format,
            "generated_at": now_str,
            "content": md_content
        }
