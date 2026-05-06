import { prisma }         from './lib/prisma'
import { storeEmbedding } from './ai/embeddings'

const documents = [{
  source:  'cv',
  title:   'IBM Experience',
  content: 'Sarath P worked as a Software Developer at IBM in Kochi India from July 2022 to present. He has 4 years of professional experience at IBM building enterprise React applications. His IBM work includes building the App Connect SaaS platform used by 150 plus global enterprise customers, leading accessibility remediation to JAWS and WCAG standards, and integrating LLM models including IBM WatsonX into production applications. He received the IBM Growth Award for top individual performance.',
},
{
  source:  'cv',
  title:   'IBM Internship Experience',
  content: 'Sarath P completed a Software Developer internship at IBM in Kochi India from January 2022 to July 2022. During his IBM internship he migrated key product modules from AngularJS to React and built frontend test coverage from scratch using React Testing Library and Jest.',
},
{
  source:  'cv',
  title:   'Frontend Skills',
  content: 'Sarath P has strong frontend development skills including React with Hooks Context and Redux, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, WebSockets, Next.js, and Carbon Design System. He specialises in frontend performance optimisation and accessibility.',
},
{
  source:  'cv',
  title:   'Backend and Testing Skills',
  content: 'Sarath P has backend skills including Node.js, Express.js, REST APIs, tRPC, and Python. For testing he uses Jest, React Testing Library, Cypress, and CodeceptJS. He is experienced in accessibility testing to JAWS and WCAG standards.',
},
{
  source:  'cv',
  title:   'Database and DevOps Skills',
  content: 'Sarath P has experience with databases including PostgreSQL, MySQL, DB2, and Prisma ORM. His DevOps skills include Git, Jenkins, OpenShift, Kubernetes, and Grafana. He follows Agile and CI/CD practices.',
},
{
  source:  'cv',
  title:   'AWS Certification and Accomplishments',
  content: 'Sarath P is AWS Certified Cloud Practitioner with certification CLF-C02 valid until April 2028. He received the IBM Growth Award for top individual performance at IBM. He published a research paper in IEEE Xplore in 2023.',
},
{
  source:  'cv',
  title:   'Education Background',
  content: 'Sarath P completed B.Tech Honours in Computer Science Engineering with a CGPA of 8.44 out of 10 from NSS College of Engineering in Palakkad Kerala, graduating in 2022.',
},
{
  source:  'project',
  title:   'Record and Replay Feature',
  content: 'Sarath built a Record and Replay feature at IBM using React. This React UI enables enterprise users to capture and retrigger integration flow messages across MQ and DB2 backends. It was a first-of-its-kind capability on the IBM App Connect SaaS platform.',
},
{
  source:  'project',
  title:   'Remote Runtime Management UI',
  content: 'Sarath built a Remote Runtime Management UI at IBM using React. This application allows enterprise users to monitor and control distributed integration runtimes from a single control plane.',
},
{
  source:  'project',
  title:   'Team Dashboard',
  content: 'Sarath built an internal Team Dashboard at IBM using React, TypeScript, and tRPC. This dashboard improved operational efficiency by 20 percent for product and release teams at IBM.',
},
{
  source:  'project',
  title:   'AngularJS to React Migration',
  content: 'Sarath led the migration of key product modules from AngularJS to React at IBM during his internship. He also built full frontend test coverage from scratch using React Testing Library and Jest.',
},
{
  source:  'publication',
  title:   'IEEE Research Paper on Visual Question Answering',
  content: 'Sarath P published a research paper titled Stacked Attention based Textbook Visual Question Answering with BERT in IEEE Xplore in 2023. This research focuses on deep learning and natural language processing for visual question answering in educational textbook content.',
},
{
  source:  'publication',
  title:   'IBM TechXchange Technical Blog Post',
  content: 'Sarath P authored a technical blog post titled Recording viewing and replaying data in IBM webMethods Hybrid Integration with App Connect published on IBM TechXchange Community in 2026.',
}]

async function main() {
  console.log('Clearing existing documents...')
  await prisma.document.deleteMany()

  console.log(`Seeding ${documents.length} documents...`)

  for (const doc of documents) {
    await storeEmbedding(doc.source, doc.title, doc.content)
    console.log(`✓ ${doc.source} — ${doc.title}`)
  }

  console.log('✅ Database seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())