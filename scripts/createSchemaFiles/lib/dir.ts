import * as fs from 'fs'
import * as path from 'path'

export function writeIndexFile(directory: string) {
  let fileData = ''
  for (const file of fs.readdirSync(directory)) {
    if (!file.endsWith('.ts')) { continue }
    if (file === 'index.ts') { continue }

    const fileName = file.split('.')[0]
    fileData += `export { ${fileName} } from './${fileName}.js'\n`
  }

  fs.writeFileSync(`${directory}/index.ts`, fileData)
}

export function deleteFilesInDirectory(directory: string) {
  for (const file of fs.readdirSync(directory)) {
    fs.unlinkSync(path.join(directory, file))
  }
}

export function deleteFolderRecursive(directory: string) {
  if (fs.existsSync(directory)) {

    fs.readdirSync(directory).forEach((file) => {
      const currentPath = path.join(directory, file)
      if (fs.lstatSync(currentPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(currentPath)
      } else {
        fs.unlinkSync(currentPath)
      }
    })

    fs.rmdirSync(directory)
  }
}


export function checkAndCreateDirectory(directory: string) {
  if (!fs.existsSync(directory)){
    fs.mkdirSync(directory, { recursive: true })
  }
}
