import { tagDescription } from '../processors/post/tag'

const PROMPT = {
    ROLE: 'Role: You are an expert Functional Medicine Practitioner and Hematologist.',
    OBJECTIVE: 'Objective: Analyze ONLY the <primary_target> data to provide an optimization plan. The <background_context> data is for silent cross-reference only.',
    CONTEXT:
        'Context: I am providing a list of Primary Biomarkers (Current and Previous values) and Contextual Biomarkers (correlated data for reference).',
    TASK: 'Task: Analyze the data and generate a report using the structure defined below',
    RULES: `### RULES OF ENGAGEMENT ###
  1. Scope Restriction: The "Biomarker Breakdown" section of your report must ONLY contain items listed under [PRIMARY TARGETS].
  2. Exclusion Rule: You are strictly forbidden from listing items from [REFERENCE CONTEXT] in the "Biomarker Breakdown" section.
  3. Usage of Reference: You may only mention items from the [REFERENCE CONTEXT] in the "Root Cause Analysis" section, and only if they explain why a Primary Target is abnormal.`,
    REPORT_STRUCTURE: `### ### REPORT STRUCTURE ### ###
## 1. Executive Summary:
**Rule:** Provide a 2-sentence overview focusing strictly on the trend of the **<PRIMARY_TARGET>** biomarkers.

# 2. Biomarker Breakdown:
**Strict Constraint:** List ONLY biomarkers found in the <PRIMARY_TARGET> tag. If a marker is in <BACKGROUND_CONTEXT>, it is FORBIDDEN to list it here.
* **Optimal:** (List qualifying Primary items)
* **Needs Attention:** (List qualifying Primary items)

# 3. Root Cause Analysis:
**Instruction:** Explain the clinical significance of the <PRIMARY_TARGET> trends. 
**Synthesis:** At this stage, incorporate data from <BACKGROUND_CONTEXT> to explain the "Why." (e.g., "The decline in Albumin is correlated with the Total Protein level of 68.80 g/L, suggesting...")

# 4. Optimization Action Plan:
* **Lifestyle & Dietary:** Specific interventions to improve <PRIMARY_TARGET> values.
* **Targeted Supplementation:** Evidence-based compounds for the specific pathways identified.
* **Next-Step Diagnostics:** Which specific markers would further clarify the <PRIMARY_TARGET> status?`,

  CONSTRAINS: `Constraints:
- **NO BOILERPLATE:** Exclude all medical disclaimers, "consult a doctor" phrases, or general health advice.
- **CLINICAL TONE:** Use professional, direct, and data-driven language.
- **FILTERING:** If it isn't a Primary Target, it does not get a dedicated bullet point in Section 2.`
} as const

export const askBioMarkers = async (
    pairs: string[],
    key: string | null,
    model: string,
    tag: string | null,
    prevPairs: string[],
    relatedContext?: string,
) => {
    if (!key) {
        throw new Error('Missing Gemini key')
    }

    const tagText = tag ? `(the analysis is in context of ${tagDescription[tag]})` : ''

    let content = `${PROMPT.ROLE}
${PROMPT.OBJECTIVE}
${PROMPT.CONTEXT}
${PROMPT.TASK}${tagText}.
### DATA INPUT ###
<primary_target> (ONLY analyze these values in the "Biomarker Breakdown" section):
  - Current: ${pairs.join(',')}`

    if (prevPairs.length) {
        content = `${content}
  - In month ago: ${prevPairs.join(',')}`
    }

    content += '\n</primary_target>'
    if (relatedContext) {
        content = `${content}
<background_context>(READ ONLY. Do NOT list these in the "Biomarker Breakdown". Use these ONLY to explain *why* the Primary Target is changing.): ${relatedContext}</background_context>`
    }
    content = `${content}

---

${PROMPT.REPORT_STRUCTURE}

---

${PROMPT.CONSTRAINS}`
    console.log(content)


    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
            method: 'POST',
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: content,
                            },
                        ],
                    },
                ],
                // generationConfig: {
                //   thinkingConfig: { thinkingLevel: "HIGH" },
                // },
                tools: [{ googleSearch: {} }],
            }),
        },
    )
    const data = await response.json()
    if (data.candidates?.[0]) {
        return data.candidates[0].content.parts[0].text
    } else {
        throw new Error(data.error.message)
    }
}
