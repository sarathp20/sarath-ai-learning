import { Chat } from './ai/llm'

async function main() {
  const chat = new Chat()

  const questions = [
    "What is Sarath's experience at IBM?",
    "What testing frameworks does Sarath know?",
    "What projects did Sarath build?",
    "What is blockchain?",           // should decline
    "What is Sarath's AWS certification?",
  ]

  for (const q of questions) {
    console.log('\n─────────────────────────────')
    console.log('Q:', q)
    process.stdout.write('A: ')
    const answer = await chat.askWithContext(q)
    console.log(answer)
  }
}

main().catch(console.error)