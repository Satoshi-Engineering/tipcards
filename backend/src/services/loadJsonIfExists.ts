import path from 'path'
import { existsSync, readFileSync } from 'fs'

const loadJsonIfExists = <T>(filepath: string | undefined, fallbackValue: T): T => {
  if (typeof filepath !== 'string') {
    return fallbackValue
  }
  try {
    const resolvedFilepath = path.resolve(filepath)
    if (!existsSync(resolvedFilepath)) {
      return fallbackValue
    }
    const jsonData = JSON.parse(
      readFileSync(
        resolvedFilepath,
        'utf-8',
      ),
    )
    const typeOfJsonData = Object.prototype.toString.call(jsonData).slice(8,-1)
    const typeOfFallbackValue = Object.prototype.toString.call(fallbackValue).slice(8,-1)
    if (typeOfJsonData !== typeOfFallbackValue) {
      console.error(`JSON file contains unexpected data type. Expected: ${typeOfFallbackValue}, received: ${typeOfJsonData}`)
      return fallbackValue
    }
    return jsonData
  } catch {
    return fallbackValue
  }
}

export default loadJsonIfExists
