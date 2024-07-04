import { createInterface } from 'readline'

export const readlineInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
})

export const prompt = (question: string): Promise<string> =>
  new Promise<string>((resolve) => {
    readlineInterface.question(question, (answer) => {
      resolve(answer)
    })
  })
