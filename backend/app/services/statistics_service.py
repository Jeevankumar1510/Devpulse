from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy import stats
from app.models.dataset import Dataset
from app.services.dataset_service import DatasetService
from app.schemas.analytics import HypothesisTestRequest, HypothesisTestResponse, ABTestRequest, ABTestResponse

class StatisticsService:
    @staticmethod
    def calculate_descriptive_stats(dataset: Dataset) -> Dict[str, Any]:
        df = DatasetService.load_dataframe(dataset)
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        summaries = []
        for col in num_cols:
            s = df[col].dropna()
            if len(s) > 0:
                q1 = float(s.quantile(0.25))
                q3 = float(s.quantile(0.75))
                iqr = q3 - q1
                summaries.append({
                    "column": col,
                    "count": int(s.count()),
                    "mean": round(float(s.mean()), 3),
                    "std": round(float(s.std()), 3),
                    "variance": round(float(s.var()), 3),
                    "min": round(float(s.min()), 3),
                    "q1": round(q1, 3),
                    "median": round(float(s.median()), 3),
                    "q3": round(q3, 3),
                    "max": round(float(s.max()), 3),
                    "iqr": round(iqr, 3),
                    "skewness": round(float(s.skew()), 3) if len(s) > 2 else 0.0,
                    "kurtosis": round(float(s.kurtosis()), 3) if len(s) > 3 else 0.0,
                    "ci_95_lower": round(float(s.mean() - 1.96 * (s.std() / np.sqrt(len(s)))), 3),
                    "ci_95_upper": round(float(s.mean() + 1.96 * (s.std() / np.sqrt(len(s)))), 3)
                })

        return {"numerical_summary": summaries}

    @staticmethod
    def run_hypothesis_test(req: HypothesisTestRequest, dataset: Dataset) -> HypothesisTestResponse:
        df = DatasetService.load_dataframe(dataset)
        alpha = req.alpha or 0.05
        test_type = req.test_type.lower()

        if test_type in ["two_sample_ttest", "independent_ttest"]:
            if req.group_col and req.group_col in df.columns:
                groups = df[req.group_col].dropna().unique()
                if len(groups) < 2:
                    raise ValueError(f"Group column '{req.group_col}' must contain at least 2 distinct categories.")
                g1 = df[df[req.group_col] == groups[0]][req.col_a].dropna()
                g2 = df[df[req.group_col] == groups[1]][req.col_a].dropna()
                t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=False)
                df_val = float(len(g1) + len(g2) - 2)
                mean_diff = float(g1.mean() - g2.mean())
                se_diff = np.sqrt(g1.var()/len(g1) + g2.var()/len(g2))
                ci = [round(mean_diff - 1.96 * se_diff, 3), round(mean_diff + 1.96 * se_diff, 3)]
                test_name = f"Welch's Two-Sample t-Test ({groups[0]} vs {groups[1]})"
            else:
                if not req.col_b or req.col_b not in df.columns:
                    raise ValueError("Independent t-test requires either group_col or col_b.")
                g1 = df[req.col_a].dropna()
                g2 = df[req.col_b].dropna()
                t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=False)
                df_val = float(len(g1) + len(g2) - 2)
                ci = None
                test_name = f"Welch's Two-Sample t-Test ('{req.col_a}' vs '{req.col_b}')"

            stat_name = "t-statistic"

        elif test_type in ["paired_ttest"]:
            if not req.col_b or req.col_b not in df.columns:
                raise ValueError("Paired t-test requires both col_a and col_b.")
            valid = df[[req.col_a, req.col_b]].dropna()
            t_stat, p_val = stats.ttest_rel(valid[req.col_a], valid[req.col_b])
            df_val = float(len(valid) - 1)
            diff = valid[req.col_a] - valid[req.col_b]
            se = diff.std() / np.sqrt(len(diff))
            ci = [round(diff.mean() - 1.96 * se, 3), round(diff.mean() + 1.96 * se, 3)]
            test_name = f"Paired Samples t-Test ('{req.col_a}' vs '{req.col_b}')"
            stat_name = "t-statistic"

        elif test_type == "anova":
            if not req.group_col or req.group_col not in df.columns:
                raise ValueError("ANOVA requires group_col.")
            groups = [group[req.col_a].dropna().values for _, group in df.groupby(req.group_col)]
            if len(groups) < 2:
                raise ValueError("ANOVA requires at least 2 distinct groups.")
            f_stat, p_val = stats.f_oneway(*groups)
            t_stat = f_stat
            df_val = float(len(groups) - 1)
            ci = None
            test_name = f"One-Way ANOVA (Factor: '{req.group_col}', Response: '{req.col_a}')"
            stat_name = "F-statistic"

        elif test_type == "chi_square":
            if not req.col_b or req.col_b not in df.columns:
                raise ValueError("Chi-square test of independence requires categorical col_a and col_b.")
            contingency = pd.crosstab(df[req.col_a], df[req.col_b])
            chi2, p_val, dof, _ = stats.chi2_contingency(contingency)
            t_stat = chi2
            df_val = float(dof)
            ci = None
            test_name = f"Pearson's Chi-Square Test ('{req.col_a}' x '{req.col_b}')"
            stat_name = "Chi-Square (χ²)"

        else:
            raise ValueError(f"Unsupported test type: {test_type}")

        reject = bool(p_val < alpha)
        if reject:
            interp = f"Statistically significant result (p = {p_val:.4e} < α = {alpha}). We reject the null hypothesis (H₀)."
        else:
            interp = f"Fail to reject the null hypothesis (p = {p_val:.4f} >= α = {alpha}). Insufficient evidence to establish a significant difference."

        return HypothesisTestResponse(
            test_name=test_name,
            statistic_name=stat_name,
            statistic_value=round(float(t_stat), 4),
            p_value=round(float(p_val), 6),
            degrees_of_freedom=df_val,
            alpha=alpha,
            reject_null_hypothesis=reject,
            interpretation=interp,
            confidence_interval=ci
        )

    @staticmethod
    def calculate_ab_test(req: ABTestRequest) -> ABTestResponse:
        n1 = req.control_visitors
        c1 = req.control_conversions
        n2 = req.variant_visitors
        c2 = req.variant_conversions

        if n1 <= 0 or n2 <= 0:
            raise ValueError("Visitor counts must be greater than zero.")

        cr1 = c1 / n1
        cr2 = c2 / n2
        abs_diff = cr2 - cr1
        rel_uplift = ((cr2 - cr1) / cr1 * 100) if cr1 > 0 else 0.0

        # Pooled 2-proportion Z-test
        p_pool = (c1 + c2) / (n1 + n2)
        se = np.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))

        z_score = (cr2 - cr1) / se if se > 0 else 0.0
        p_value = float(2 * (1 - stats.norm.cdf(abs(z_score))))

        # Confidence interval
        se_unpooled = np.sqrt((cr1 * (1 - cr1) / n1) + (cr2 * (1 - cr2) / n2))
        z_crit = stats.norm.ppf(1 - (1 - req.confidence_level) / 2)
        ci_lower = round(float(abs_diff - z_crit * se_unpooled) * 100, 2)
        ci_upper = round(float(abs_diff + z_crit * se_unpooled) * 100, 2)

        is_significant = bool(p_value < (1.0 - req.confidence_level))

        # Sample size estimation for 80% power at 5% significance
        sample_rec = int(16 * (p_pool * (1 - p_pool)) / max(abs_diff ** 2, 0.0001))

        if is_significant and rel_uplift > 0:
            rec = f"Deploy Variant B: Statistically significant improvement of +{rel_uplift:.2f}% observed (p = {p_value:.4f})."
        elif is_significant and rel_uplift < 0:
            rec = f"Keep Control A: Variant B demonstrated a statistically significant regression of {rel_uplift:.2f}% (p = {p_value:.4f})."
        else:
            rec = f"Inconclusive Result: p-value ({p_value:.4f}) does not meet the {int(req.confidence_level*100)}% confidence threshold. Recommend extending sample size to ~{sample_rec:,} visitors."

        return ABTestResponse(
            control_cr=round(cr1 * 100, 2),
            variant_cr=round(cr2 * 100, 2),
            relative_uplift_pct=round(rel_uplift, 2),
            absolute_difference=round(abs_diff * 100, 2),
            z_score=round(float(z_score), 3),
            p_value=round(p_value, 5),
            confidence_interval=[ci_lower, ci_upper],
            is_statistically_significant=is_significant,
            sample_size_recommendation=max(1000, sample_rec),
            business_recommendation=rec
        )
