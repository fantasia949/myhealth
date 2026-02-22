# Investigation Report: PhenoAge Correlations

## 1. RDW-CV Discrepancy (Resolved)

The user observed that while RDW-CV has the "greatest impact" (highest coefficient) in the PhenoAge formula, its observed p-value (0.008) and correlation coefficient (0.49) in the application are lower than expected.

### Findings
- **Formula Verification:** `getPhenotypicAge` implementation correctly uses Levine et al. (2018) coefficients, with RDW-CV having the largest positive weight (0.3306).
- **Variance Analysis:** RDW-CV is indeed the primary driver of score variance (StdDev 0.23) compared to Age (0.09) and Creatinine (0.07).
- **Explanation:** The lower observed correlation is due to a **Suppression Effect** with Age in this specific dataset:
    - RDW-CV has a strong negative correlation with Age (-0.52).
    - As Age increases, PhenoAge increases (+0.08/year).
    - But as Age increases, RDW-CV tends to decrease, pushing PhenoAge down.
    - These opposing forces partially cancel out, dampening the net correlation of RDW-CV with the final score.

## 2. GGT High Rank (Investigated)

The user asked why Gamma-Glutamyl Transferase (GGT) is ranked 2nd in the correlation list (0.6750, p=0.0001) despite not being a component of the PhenoAge formula.

### Findings
We analyzed the correlations of GGT with PhenoAge components in the full dataset (n=26).
- **GGT vs Age:** **0.96** (p < 0.00001) - Extremely strong positive correlation.
- **GGT vs PhenoAge:** 0.54 (p=0.006).

### Explanation
GGT acts as a near-perfect **proxy for Chronological Age** in this specific dataset (rho=0.96).
- Since **Chronological Age** is a direct component of the PhenoAge formula (+0.0804 * Age), any marker that tracks Age perfectly will also track PhenoAge very closely.
- Unlike RDW-CV (which fights the Age trend), GGT moves in lockstep with Age. This allows it to "ride" the Age contribution to the score without the interference/cancellation effects seen with RDW-CV.
- Effectively, GGT is ranked highly not because it drives the PhenoAge score directly, but because it is an excellent surrogate for the **Age** term in the formula for this user.

## Conclusion
The application is functioning correctly.
- RDW-CV's impact is real but masked by its negative interaction with Age.
- GGT's high rank is a byproduct of its extremely strong correlation with Chronological Age in this dataset.

No code changes are required.
