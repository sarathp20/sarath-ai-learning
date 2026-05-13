// src/ai/tools.ts

import { ChatCompletionTool } from "openai/resources.js"

// ── Tool definitions — what the model sees ────────────────────────────────────
export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_contact_info',
      description: "Returns ONLY Sarath's contact channels — email address, LinkedIn URL, GitHub URL, and portfolio URL. Call this ONLY when the user explicitly asks how to contact Sarath or asks for his email, LinkedIn, or social links.",
      parameters: {
        type: 'object',
        properties: {},  // no inputs needed
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_github_repos',
      description: "Fetches Sarath's public GitHub repositories. Returns repo names, descriptions, and URLs.",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_blog_stats',
      description: "Returns titles of Sarath's published blog posts.",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
    {
    type: 'function',
    function: {
      name: 'get_repo_details',
      description: "Fetches detailed information about a specific GitHub repository when the parameter repo_name (string) — the name of the repository to fetch details for Executor"+
      "calls https://api.github.com/repos/sarathp20/{repo_name} returns name, description, language, topics, html_url, readmeContent",
      parameters: {
        type: 'object',
        properties: {
          repo_name: {
            type: 'string',
            description: 'The repository name only — NOT the full path. Example: "sarath-portfolio" not "sarathp20/sarath-portfolio"'
          }
        },
        required: ['repo_name']
      },
    },
  },
]

// ── Executor functions — what your code runs ──────────────────────────────────

export async function executeGetContactInfo(): Promise<object> {
  return {
    email: 'sarathp20@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sarath-p-77ab97183',
    github: 'https://github.com/sarathp20',
    portfolio: 'https://sarath-technical-portfolio.vercel.app',
  }
}

export async function executeGetGithubRepos(): Promise<object[]> {
  const token = process.env.GITHUB_TOKEN
  const url = 'https://api.github.com/users/sarathp20/repos?type=owner&sort=updated&per_page=100'

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'sarath-ai-learning',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return data
    .filter((repo: any) => !repo.fork)  // exclude forks
    .map((repo: any) => ({
      name: repo.name,
      description: repo.description ?? 'No description',
      url: repo.html_url,
    }))
}

export async function executeGetGithubRepoDetails(args: Record<string, string>): Promise<object> {
  const repoName = args.repo_name
    .replace(/^sarathp20\//, '')  // remove "sarathp20/" prefix if present
    .replace(/^.*\//, '')          // remove any other owner/ prefix
    .trim()
  const token = process.env.GITHUB_TOKEN
  const repoUrl = `https://api.github.com/repos/sarathp20/${repoName}`
  const readmeUrl = `https://api.github.com/repos/sarathp20/${repoName}/readme`

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'sarath-ai-learning',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  console.log('name======', args.repo_name)
  const [response1, response2] = await Promise.all(
    [fetch(repoUrl, { headers }), fetch(readmeUrl, { headers })]
  )

  if (!response1.ok) {
    throw new Error(`GitHub repo details fetch failed: ${response1.status} ${response1.statusText}`)
  }
// Don't throw — return what you have without the README
if (!response2.ok) {
  // README doesn't exist — return repo details without it
  const repoDetails = await response1.json()
  return {
    name:        repoDetails.name,
    description: repoDetails.description ?? 'No description',
    url:         repoDetails.html_url,
    language:    repoDetails.language,
    topics:      repoDetails.topics,
    readmeContent: 'No README available for this repository.',
  }
}

  const repoDetails = await response1.json()
  const readmeDetails = await response2.json()
  const readmeContent = Buffer.from(readmeDetails.content, 'base64').toString('utf-8')
  return repoDetails.fork ? { error: true, message: 'No details available about the repo as it is a fork' } :
    {
      name: repoDetails.name,
      description: repoDetails.description ?? 'No description',
      url: repoDetails.html_url,
      language: repoDetails.language,
      topics: repoDetails.topics,
      readmeContent: readmeContent
    }
}

export async function executeGetBlogStats(): Promise<object[]> {
  // Hardcoded for now — later this will query your portfolio DB
  return [
    { title: 'What I learned building a full-stack portfolio with Next.js' },
    { title: 'JWT vs Sessions — when to use which' },
    { title: 'How I integrated the GitHub API with ISR caching' },
  ]
}

// ── Router — maps tool name to executor ───────────────────────────────────────
// When model calls a tool by name, this runs the right function
export async function executeTool(name: string, args: Record<string, string> = {}): Promise<object | object[]> {
  switch (name) {
    case 'get_contact_info': return executeGetContactInfo()
    case 'get_github_repos': return executeGetGithubRepos()
    case 'get_repo_details': return executeGetGithubRepoDetails(args)
    case 'get_blog_stats': return executeGetBlogStats()
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}