import { tagDescription } from '../processors/post/tag'

const PROMPT = {
    ROLE: 'Role: You are an expert Functional Medicine Practitioner and Hematologist. You are analyzing a specific set of blood test results to provide a tactical, science-based optimization plan.\n',
    CONTEXT:
        'Context: I am providing a list of Primary Biomarkers (Current and Previous values) and Contextual Biomarkers (correlated data for reference).\n',
    TASK: 'Task: Analyze the data and generate a report using the structure defined below',
    REPORT_STRUCTURE: `Report Structure:
1. Executive Summary: A concise 2-sentence overview of the trend (improving, worsening, or stable).
2. Biomarker Breakdown
  - Optimal: List items within the ideal functional range.
  - Needs Attention: List items out of range or trending negatively.
3. Root Cause Analysis: Why are the "Needs Attention" items off? Use the Contextual Biomarkers here to support your theory (e.g., if Uric Acid is high, check the eGFR and HbA1c context to see if it is kidney or metabolic related).
4. Action Plan (Non-Medical):
  - Lifestyle/Dietary: Specific changes to address the root causes.
  - Supplements: Evidence-based compounds that target these specific pathways.
  - Further Investigation: What specific other markers would clarify the picture?\n`,
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

    let content = `${PROMPT.ROLE}${PROMPT.CONTEXT}${PROMPT.TASK}${tagText}.
Input Data:
  - Primary Biomarkers:
    - Current: ${pairs.join(',')}`

    if (prevPairs.length) {
        content = `${content}
    - In month ago: ${prevPairs.join(',')}`
    }

    if (relatedContext) {
        content = `${content}
  - Contextual/Related Biomarkers: ${relatedContext}. Note: Use these only to inform the root cause analysis of the Primary Biomarkers. Do not analyze these individually unless they directly explain a Primary issue.`
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
