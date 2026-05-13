// import { Chat } from './ai/llm'

// async function main() {
//   const chat = new Chat()

//   const questions = [
//     "What is Sarath's experience at IBM?",
//     "What testing frameworks does Sarath know?",
//     "What projects did Sarath build?",
//     "What is blockchain?",           // should decline
//     "What is Sarath's AWS certification?",
//   ]

//   for (const q of questions) {
//     console.log('\n─────────────────────────────')
//     console.log('Q:', q)
//     process.stdout.write('A: ')
//     const answer = await chat.askWithContext(q)
//     console.log(answer)
//   }
// }

// main().catch(console.error)

import { runAgent } from './ai/agents'

async function main() {
const questions = [
  // Should use RAG context — no tool needed
  "What is Sarath's experience at IBM?",
  "What testing frameworks does Sarath know?",

  // Should use tools — dynamic data
  "What are Sarath's GitHub repos?",
  "Tell me about the epic-generator repository",

  // Interesting case — could use either
  "What projects has Sarath built?",
]

  for (const q of questions) {
    console.log('\n─────────────────────────────')
    console.log('Q:', q)
    const answer = await runAgent(q)
    console.log('A:', answer)
  }
}

main().catch(console.error)