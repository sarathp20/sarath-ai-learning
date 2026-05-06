import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { search } from './embeddings'

const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
})

export class Chat {
    private messageContext: ChatCompletionMessageParam[]
    constructor() {
        this.messageContext = [{
            role: 'system',
            content: `You are an AI assistant for Sarath P's portfolio. You answer questions about Sarath's skills, experience, projects, publications, certifications and blogs. 
Only answer questions about Sarath. If asked about anything else, politely decline and redirect to Sarath's work. Never make up information. Respond in plain text only. No markdown. Keep answers under 3 sentences unless more detail is specifically requested. Be professional and direct. Don't use filler phrases like 'Certainly!' or 'Great question!'. Get straight to the answer.`
        }]
    }
    async send(message: string) {
        this.messageContext.push({ role: 'user', content: message })
        const response = await client.chat.completions.create({
            model: 'llama3.2',
            messages: this.messageContext,
        })
        this.messageContext.push({ role: 'assistant', content: response.choices[0]?.message?.content ?? 'No response' })
        return response.choices[0]?.message?.content ?? 'No response'
    }
    async stream(message: string): Promise<string> {
        this.messageContext.push({ role: 'user', content: message })

        const streamChunks = await client.chat.completions.create({
            model: 'llama3.2',
            messages: this.messageContext,
            stream: true,
        })

        let fullResponse = ''

        for await (const chunk of streamChunks) {
            const token = chunk.choices[0]?.delta?.content ?? ''  // ← extract once
            process.stdout.write(token)
            fullResponse += token                                  // ← cleaner concat
        }

        this.messageContext.push({ role: 'assistant', content: fullResponse })
        return fullResponse
    }

    async askWithContext(question: string): Promise<string> {
        // 1. Search for relevant chunks
        const chunks = await search(question)

        // 2. Format chunks into readable context string
        const context = chunks
            .map(chunk => `[${chunk.title}]: ${chunk.content}`)
            .join('\n')

        // 3. Build user message with context + question
        const userMessage = `Answer using ONLY the context below. If the context doesn't contain the answer, say "I don't have that information about Sarath."

Context:
${context}

Question: ${question}`

        // 4. Push to history and call API
        this.messageContext.push({ role: 'user', content: userMessage })

        const response = await client.chat.completions.create({
            model: 'llama3.2',
            messages: this.messageContext,
        })

        const text = response.choices[0]?.message?.content ?? 'No response'

        // 5. Save response to history
        this.messageContext.push({ role: 'assistant', content: text })

        return text
    }
}

export async function ask(question: string): Promise<string> {
    const response = await client.chat.completions.create({
        model: 'llama3.2',
        messages: [
            { role: 'system', content: 'You are helpful and concise.' },
            { role: 'user', content: question },
        ],
    })

    return response.choices[0]?.message?.content ?? 'No response'
}
