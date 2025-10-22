import { tagDescription } from "../processors/post/tag";

export const askBioMarkers = async (
  pairs: string[],
  key: string | null,
  tag: string | null
) => {
  if (!key) {
    throw new Error("Missing Gemini key");
  }

  const tagText = tag
    ? `The following analysis is about ${tagDescription[tag]}.`
    : "";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
    {
      method: "POST",
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional medical expert who can analyze a list of biomarkers from blood tests. I will provide you with a list of biomarkers and their values, and you will need to analyze them and provide me with a report. ${tagText}
                The report should include:
                - A summary of the results
                - What are the good and bad biomarkers
                - What are the possible causes of the bad biomarkers
                - What are the possible solutions to improve the bad biomarkers
                - What are the possible supplements to improve the bad biomarkers

                The biomarkers are: ${pairs.join(",")}`,
              },
            ],
          },
        ],
      }),
    }
  );
  const data = await response.json();
  if (data.candidates?.[0]) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error(data.error.message);
  }
};
