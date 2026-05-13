// src/ai/agent.ts
import OpenAI from 'openai'
import { tools, executeTool, executeGetContactInfo, executeGetGithubRepos, executeGetGithubRepoDetails, executeGetBlogStats } from './tools'
import { search } from './embeddings'

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
})

const knownRepos = [
  'sarath-portfolio',
  'sarath-ai-learning',
  'my-backend-learning-applications',
  'epic-generator',
  'PriceTag',
  'Bchats',
]

export async function runAgent(question: string): Promise<string> {

  // ── Classify the question ─────────────────────────────────────────────────
  const q = question.toLowerCase()

  const isContactQuestion = ['contact', 'email', 'linkedin', 'reach', 'social'].some(k => q.includes(k))
  const isRepoListQuestion = ['github repos', 'repositories', 'github projects'].some(k => q.includes(k))
  const isRepDetailQuestion = ['tell me about', 'what is', 'details about', 'explain'].some(k => q.includes(k))
    && ['repo', 'repository', 'project', ...knownRepos].some(k => q.includes(k))
  const isBlogQuestion = ['blog', 'written', 'post', 'article', 'writing'].some(k => q.includes(k))

  // ── Fetch tool data if needed ─────────────────────────────────────────────
  let toolContext = ''

  if (isContactQuestion) {
    const data = await executeGetContactInfo()
    toolContext = `Contact information: ${JSON.stringify(data)}`
  } else if (isRepoListQuestion) {
    const data = await executeGetGithubRepos()
    toolContext = `GitHub repositories: ${JSON.stringify(data)}`
  } else if (isRepDetailQuestion) {
    // Extract repo name from question
    const repoName = knownRepos.find(r => q.includes(r.toLowerCase())) ?? ''
    if (repoName) {
      const data = await executeGetGithubRepoDetails({ repo_name: repoName })
      toolContext = `Repository details: ${JSON.stringify(data)}`
    }
  } else if (isBlogQuestion) {
    const data = await executeGetBlogStats()
    toolContext = `Blog posts: ${JSON.stringify(data)}`
  }

  // ── Get RAG context ───────────────────────────────────────────────────────
  const ragChunks = await search(question, 3)
  const ragContext = ragChunks
    .map(c => `[${c.title}]: ${c.content}`)
    .join('\n\n')

  // ── Build final prompt ────────────────────────────────────────────────────
  const context = [
    ragContext,
    toolContext ? `\nLive data:\n${toolContext}` : '',
  ].filter(Boolean).join('\n\n')

  const response = await client.chat.completions.create({
    model:    'llama3.2',
    messages: [
      {
        role:    'system',
        content: `You are an AI assistant for Sarath P's portfolio.
Answer the question using the context below. Be concise and direct.
Never make up information not in the context.

Context:
${context}`,
      },
      { role: 'user', content: question },
    ],
    // NO tools passed — model just answers, no tool calling
  })

  return response.choices[0]?.message?.content ?? 'No response'
}