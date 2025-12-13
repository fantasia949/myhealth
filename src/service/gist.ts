export async function createGist(content: string, token: string): Promise<string> {
  const response = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${token}`,
    },
    body: JSON.stringify({
      description: "BioMarker AI Result",
      public: false,
      files: {
        "biomarker.md": {
          content,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create gist: ${response.statusText}`);
  }

  const data = await response.json();
  return data.html_url;
}
