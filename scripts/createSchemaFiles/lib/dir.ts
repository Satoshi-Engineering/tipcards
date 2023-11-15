import * as fs from 'fs'
import * as path from 'path'

export function writeIndexFile(directory: string) {
  let fileData = ''
  for (const file of fs.readdirSync(directory)) {
    if (!file.endsWith('.ts')) continue
    if (file === 'index.ts') continue

    const fileName = file.split('.')[0]
    fileData += `export { ${fileName} } from './${fileName}'\n`
  }

  fs.writeFileSync(`${directory}/index.ts`, fileData)
}

export function deleteSchemaFiles(directory: string) {
  for (const file of fs.readdirSync(directory)) {
    fs.unlinkSync(path.join(directory, file))
  }
}
