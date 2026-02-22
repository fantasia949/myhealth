# Investigation Report: PhenoAge RDW-CV Impact vs Correlation

## Issue Description
The user observed that while RDW-CV has the "greatest impact" in the PhenoAge formula, its observed p-value and coefficient in the correlation tool do not reflect this high importance.

## Findings

### 1. Formula Verification
We verified the implementation of `getPhenotypicAge` in `src/processors/enrich/phenoAge.ts` and confirmed that the coefficients match the original Levine et al. (2018) paper.
- **RDW-CV Coefficient:** 0.3306 (Largest positive coefficient)
- **Age Coefficient:** 0.0804
- **Glucose Coefficient:** 0.1953
- **Creatinine Coefficient:** 0.0095

This confirms that RDW-CV indeed has the highest "per unit" impact on the PhenoAge score.

### 2. Data Analysis
We analyzed the correlation of PhenoAge with its components using the provided dataset (n=20).
- **RDW-CV Correlation:** 0.38 (p=0.09) - Moderate, not significant.
- **Creatinine Correlation:** 0.58 (p=0.006) - Strong, significant.
- **Age Correlation:** 0.26 (p=0.26) - Weak, not significant.

### 3. Explanation of Discrepancy
The discrepancy between the high theoretical coefficient and low observed correlation is due to:
1.  **Dataset Properties:** The dataset is small (n=20), making p-values highly sensitive to noise.
2.  **Negative Correlation with Age:** In this specific dataset, RDW-CV has a strong *negative* correlation with Age (-0.52). Since Age increases PhenoAge (+0.08/year) and RDW increases PhenoAge (+0.33/unit), the fact that RDW decreases as Age increases causes their effects to partially cancel out. This reduces the net correlation of both variables with the final PhenoAge score.
3.  **Consistency of Other Markers:** Creatinine, despite having a smaller coefficient, tracks the PhenoAge fluctuations more consistently in this dataset (possibly because it aligns better with the net aging signal or has less independent noise), resulting in a higher observed correlation.

## Conclusion
The application is functioning correctly. The PhenoAge calculation uses the correct high-impact coefficient for RDW-CV. The low observed correlation is a correct statistical reflection of the specific dataset provided, where RDW-CV's contribution is masked by its interaction with Age and other factors.

No code changes are required to fix the calculation. A verification test `tests/verify_phenoage_coefficients.spec.ts` has been added to ensure the formula's integrity in future updates.
