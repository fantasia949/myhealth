import { HfInference } from '@huggingface/inference'

const model = 'gemini-2.0-pro-exp-02-05' // 'gemini-2.0-flash'

export async function askAI(context, question, key) {
    const cache = sessionStorage.getItem(question)
    if (cache) {
        return cache
    }
    if (!key) {
        throw new Error('Please input gemini key')
    }
    // const hf = new HfInference();
    // const response = await hf.textGeneration({
    //   endpointUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    //   contents: [
    //     {
    //       parts: [
    //         {
    //           text: question,
    //         },
    //       ],
    //     },
    //   ],
    // });
    // console.log(response);
    // const text = response.generated_text;
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: context },
                            {
                                text: question,
                            },
                        ],
                    },
                ],
            }),
        }
    )

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    const data = await response.json()
    const text = data.candidates
        .flatMap(candidate => candidate.content.parts.map(part => part.text))
        .join('\n')

    sessionStorage.setItem(question, text)

    return text
}

const context =
    'You are a health science researcher who has years in cellular and structural biology, '

export async function askBioMarkers(pairs, key) {
    let suffix =
        '  with optimal range info for young male and well-studied nutritional advise as short answer'
    if (pairs.length > 1) {
        suffix += ', their relationship and significance if any'
    }
    const prefix = 'help me evaluate these biomarkers'
    const values = pairs.join(', ')
    const question = `${prefix} ${values} ${suffix}`
    return askAI(context, question, key)
}

export async function askDefinitions(pairs, key) {
    let suffix = '  with optimal range info in young age'
    let prefix = 'help me evaluate these biomarkers '
    if (pairs.length > 1) {
        suffix += ' their relationship and significance'
    }
    const values = pairs.join(', ')
    const question = `${prefix} ${values} ${suffix}`
    return askAI(question, key)
}
