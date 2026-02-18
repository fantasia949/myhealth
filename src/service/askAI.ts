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
    REPORT_STRUCTURE: `### REPORT STRUCTURE ###
1. Executive Summary: A concise 2-sentence overview of the trend found in <primary_target> ONLY.
2. Biomarker Breakdown (STRICT FILTER APPLIED):
   - INSTRUCTION: List ONLY items found inside the <primary_target> tags above.
   - CONSTRAINT: If a biomarker is listed in <background_context>, it must NOT appear in this list.
   - Optimal: [List qualifying <primary_target> items]
   - Needs Attention: [List qualifying <primary_target> items]
3. Root Cause Analysis:
   - Why are the <primary_target> items changing?
   - NOW you may reference the <background_context> data to explain the mechanism (e.g., "Albumin is trending down, and looking at the background context, Total Protein is also on the lower side, suggesting...").
4. Action Plan (Non-Medical):
   - Lifestyle/Dietary: Specific changes for the <primary_target>.
   - Supplements: Compounds for the <primary_target>.
   - Further Investigation: Markers to clarify the <primary_target>.`,
  CONSTRAINS: `Constraints:
  - Direct Analysis Only: Do not include standard medical disclaimers, "consult a doctor" boilerplate, or general health platitudes. Assume the user is aware of medical safety protocols.
  - Tone: Clinical, direct, and actionable.`
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
[REFERENCE CONTEXT] (READ ONLY. Do NOT list these in the "Biomarker Breakdown". Use these ONLY to explain *why* the Primary Target is changing.): ${relatedContext}.`
    }
    content = `${content}
${PROMPT.REPORT_STRUCTURE}
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
