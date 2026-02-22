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

## 3. eGFR vs RDW-CV Rank (Investigated)

The user asked why eGFR (Estimated Glomerular Filtration Rate) is ranked higher (0.5099) than RDW-CV (0.4952).

### Findings
- **eGFR vs PhenoAge:** -0.65 (Strong negative correlation).
- **eGFR vs Creatinine:** -0.71 (Strong negative correlation, expected as eGFR is calculated from Creatinine).
- **Creatinine vs PhenoAge:** 0.69 (Strong positive correlation).

### Explanation
eGFR is mathematically derived directly from **Creatinine** (and Age/Cystatin C).
- **Creatinine** is a direct component of the PhenoAge formula with a significant positive correlation (0.69) in this dataset.
- Because eGFR is inversely proportional to Creatinine (higher Creatinine = lower eGFR), it inherits this strong correlation in the reverse direction.
- Since Creatinine correlates better with PhenoAge than RDW-CV does (due to the RDW suppression effect explained above), eGFR (as a proxy for Creatinine) also correlates better than RDW-CV.

## Conclusion
The application is functioning correctly.
- RDW-CV's impact is real but masked by its negative interaction with Age.
- GGT's high rank is due to it being a proxy for Age.
- eGFR's high rank is due to it being a proxy for Creatinine (which correlates well in this dataset).

No code changes are required.
