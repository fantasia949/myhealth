import { GistFile } from './gist.types'

const QUICK_NOTE_GIST_ID = '7853cbe1c3e9bd514e89ac06bf74b54b'
const QUICK_NOTE_FILENAME = 'notes.txt'

export async function createGist(content: string, token: string, keys: string): Promise<string> {
  const prefix = 'biomarker'
  const now = new Date()
  const suffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const fileName = `${prefix}_${keys}_${suffix}.md`
  const response = await fetch('https://api.github.com/gists/f0423911a4f974338132d2a160b6c638', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description: 'BioMarker AI Result',
      public: false,
      files: {
        [fileName]: {
          content,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create gist: ${response.statusText}`)
  }

  const data = await response.json()
  return data.html_url
}

export async function getGistFiles(): Promise<GistFile[]> {
  const response = await fetch('https://api.github.com/gists/f0423911a4f974338132d2a160b6c638', {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch gist files: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.files) return []

  return (Object.values(data.files) as { filename: string; content?: string | null }[]).map(
    (file) => ({
      filename: file.filename,
      content: file.content || '',
    }),
  )
}

export async function fetchQuickNote(
  token?: string | null,
  gistId = QUICK_NOTE_GIST_ID,
  filename = QUICK_NOTE_FILENAME,
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch note: ${response.statusText}`)
  }

  const data = await response.json()
  const fileObj = data.files?.[filename]
  if (!fileObj) {
    return ''
  }
  return fileObj.content || ''
}

export async function saveQuickNote(
  content: string,
  token: string,
  gistId = QUICK_NOTE_GIST_ID,
  filename = QUICK_NOTE_FILENAME,
): Promise<void> {
  if (!token) {
    throw new Error('Gist token is required to save notes.')
  }

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description: 'Quick Notes',
      files: {
        [filename]: {
          content: content || ' ',
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save note: ${response.statusText}`)
  }
}
