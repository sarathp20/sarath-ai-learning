import { prisma } from '../lib/prisma'

export async function embed(text: string): Promise<number[]> {
    const response = await fetch('http://localhost:11434/api/embeddings',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'nomic-embed-text',
                prompt: text,
            })
        }
    )
    if (!response.ok) {
        throw new Error(`Embedding failed: ${response.status} ${await response.text()}`)
    }
    const data = await response.json()
    return data.embedding
}

export async function storeEmbedding(
    source: string,
    title: string,
    content: string
): Promise<void> {
    const vector = await embed(content)
    const vectorString = `[${vector.join(',')}]`

    // Use raw SQL — Prisma can't handle vector type directly
    await prisma.$executeRaw`
    INSERT INTO "Document" (id, source, title, content, embedding, "createdAt")
    VALUES (
      gen_random_uuid(),
      ${source},
      ${title},
      ${content},
      ${vectorString}::vector,
      NOW()
    )
  `
}

export async function search(
    question: string,
    limit: number = 3
): Promise<{ title: string; content: string; source: string }[]> {
    const vector = await embed(question)
    const vectorString = `[${vector.join(',')}]`
    const results = await prisma.$queryRaw<{ title: string; content: string; source: string; distance: number }[]>`
  SELECT source, title, content,
         embedding <=> ${vectorString}::vector AS distance
  FROM "Document"
  ORDER BY embedding <=> ${vectorString}::vector
  LIMIT 5
`
    return results
}