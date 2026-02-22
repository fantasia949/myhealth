# Investigation Report: PhenoAge RDW-CV Impact vs Correlation

## Issue Description
The user observed that while RDW-CV has the "greatest impact" (highest coefficient) in the PhenoAge formula, its observed p-value (0.008) and correlation coefficient (0.49) in the application are lower than other non-component biomarkers like Cystatin C (0.67) and GGT (0.67).

## Findings

### 1. Formula Verification
We verified the implementation of `getPhenotypicAge` in `src/processors/enrich/phenoAge.ts` and confirmed that the coefficients match the original Levine et al. (2018) paper.
- **RDW-CV Coefficient:** 0.3306 (Largest positive coefficient)
- **Age Coefficient:** 0.0804
- **Glucose Coefficient:** 0.1953
- **Creatinine Coefficient:** 0.0095

This confirms that RDW-CV indeed has the highest "per unit" impact on the PhenoAge score.

### 2. Variance Analysis (Why RDW Drives the Score)
We analyzed the contribution of each weighted term to the total variance of the PhenoAge score using the full dataset (n=24).
- **RDW Contribution (Std Dev):** 0.2343 (Primary driver)
- **Age Contribution (Std Dev):** 0.0945
- **Creatinine Contribution (Std Dev):** 0.0759

RDW-CV is the primary source of variation in the calculated PhenoAge score for this dataset.

### 3. Explanation of Lower Correlation (The Paradox)
Despite being the primary driver, RDW-CV's correlation with the total score (0.49-0.63) is dampened due to a **Suppression Effect** with Age:
1.  **Negative Correlation:** In this dataset, RDW-CV has a strong negative correlation with Chronological Age (-0.52).
2.  **Opposing Effects:**
    -   As Age increases, it pushes the PhenoAge score **UP** (+0.08/year).
    -   However, as Age increases, RDW-CV tends to decrease, pushing the PhenoAge score **DOWN** (+0.33/unit * decrease).
    -   These two effects partially cancel each other out.
3.  **Result:** The net correlation of RDW-CV with the final score is weaker than its individual contribution would suggest, because it is "fighting" the trend of Age.

### 4. Comparison with Cystatin C
Non-component markers like Cystatin C (0.67) show higher correlation because they are robust biological aging markers that align with the *net outcome* of the PhenoAge calculation (which aggregates multiple aging signals) without being subject to the specific mechanical cancellation that affects RDW-CV and Age within the formula itself.

## Conclusion
The application is functioning correctly. The PhenoAge calculation uses the correct high-impact coefficient for RDW-CV. The observed correlation hierarchy is a valid statistical result of the specific relationships between biomarkers in this dataset, particularly the negative interaction between RDW-CV and Age.

No code changes are required to fix the calculation. A verification test `tests/verify_phenoage_coefficients.spec.ts` has been added to ensure the formula's integrity in future updates.
