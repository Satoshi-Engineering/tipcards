import { readFileSync, readdirSync } from 'node:fs'
import { stdout } from 'node:process'

const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const ciConfig = readdirSync('gitlab-ci')
  .filter(fileName => fileName.endsWith('.yml'))
  .map(fileName => readFileSync(`gitlab-ci/${fileName}`, 'utf8'))
  .join('\n')
const checks = [
  ['Cypress', 'node_modules/cypress', /cypress\/included:(?:cypress-)?(\d+\.\d+\.\d+)/g],
  ['Playwright', 'node_modules/@playwright/test', /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-/g],
]

for (const [name, packageName, imagePattern] of checks) {
  const packageVersion = packageLock.packages[packageName].version
  const imageVersions = [...ciConfig.matchAll(imagePattern)].map(match => match[1])

  if (imageVersions.length === 0) {
    throw new Error(`No ${name} CI image found`)
  }

  if (imageVersions.some(imageVersion => imageVersion !== packageVersion)) {
    throw new Error(`${name} package version ${packageVersion} does not match CI image versions: ${imageVersions.join(', ')}`)
  }
}

stdout.write('Cypress and Playwright CI image versions match package-lock.json\n')
