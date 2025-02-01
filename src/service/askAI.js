const model = "gemini-2.0-flash-exp"; // 'gemini-1.5-flash'

export async function askAI(question, key) {
  if (!key) {
    throw new Error("Please input gemini key");
  }
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

  const data = await response.json();
  const text = data.candidates
    .flatMap((candidate) => candidate.content.parts.map((part) => part.text))
    .join("\n");

  return text;
}

const suffix = "  with optimal range info in young age as short answer";
const prefix = "Biomarker";

export async function askBioMarkers(pairs, key) {
  const values = pairs.join(", ");
  const question = `${prefix} ${values} ${suffix}`;
  return askAI(question, key);
}
