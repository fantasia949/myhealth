const model = "gemini-2.0-pro-exp-02-05"; // 'gemini-2.0-flash'

export async function askAI(question, key) {
  const cache = sessionStorage.getItem(question);
  if (cache) {
    return cache;
  }
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

  sessionStorage.setItem(question, text);

  return text;
}

export async function askBioMarkers(pairs, key) {
  const suffix =
    "  with optimal range info for young male and nutritional advise as short answer";
  const prefix = "Biomarker";
  const values = pairs.join(", ");
  const question = `${prefix} ${values} ${suffix}`;
  return askAI(question, key);
}

export async function askDefinitions(pairs, key) {
  const suffix = "  with optimal range info in young age";
  const prefix = "Biomarker";
  const values = pairs.join(", ");
  const question = `${prefix} ${values} ${suffix}`;
  return askAI(question, key);
}
