export async function createGist(content: string, token: string, keys: string): Promise<string> {
  const prefix = "biomarker"
  const suffix = Date.now()
  const fileName = `${prefix}_${keys}_${suffix}.md`
  const response = await fetch("https://api.github.com/gists/f0423911a4f974338132d2a160b6c638", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description: "BioMarker AI Result",
      public: false,
      files: {
        [fileName]: {
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
