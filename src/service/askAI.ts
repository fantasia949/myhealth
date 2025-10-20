import { tagDescription } from "../processors/post/tag";

// Define model type and value
const model: string = "gemini-2.5-pro"; // 'gemini-2.0-flash'

// Define interfaces for API response
interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

export async function askAI(
  context: string,
  question: string,
  key: string
): Promise<string> {
  const cache = sessionStorage.getItem(question);
  if (cache) {
    return cache;
  }
  if (!key) {
    throw new Error("Please input gemini key");
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates
    .flatMap((candidate) => candidate.content.parts.map((part) => part.text))
    .join("\n");

  sessionStorage.setItem(question, text);

  return text;
}

const context: string =
  "You are a health science researcher who has years in cellular and structural biology, ";

export async function askBioMarkers(
  pairs: string[],
  key: string,
  topic?: string
): Promise<string> {
  let suffix: string =
    "  with optimal range info for young male and well-studied nutritional advise as short answer. In additional, let me know related info or studies that may interest me";
  if (pairs.length > 1) {
    suffix += ", their relationship and significance if any";
  }
  let prefix = "help me evaluate these biomarkers";
  if (topic) {
    prefix += "in context of " + tagDescription[topic];
  }
  const values = pairs.join(", ");
  const question = `${prefix}: ${values} ${suffix}`;
  return askAI(context, question, key);
}

export async function askDefinitions(
  pairs: string[],
  key: string
): Promise<string> {
  let suffix: string = "  with optimal range info in young age";
  let prefix: string = "help me evaluate these biomarkers ";
  if (pairs.length > 1) {
    suffix += " their relationship and significance";
  }
  const values = pairs.join(", ");
  const question = `${prefix} ${values} ${suffix}`;
  return askAI(context, question, key);
}
