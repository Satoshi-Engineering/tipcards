import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'
import { URL } from 'node:url'

const CYPRESS_IMAGE_VERSION_PATTERN = /cypress\/included:(?:cypress-)?(\d+\.\d+\.\d+)/g
const PLAYWRIGHT_IMAGE_VERSION_PATTERN = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-/g
const CYPRESS_IMAGE_PATTERN = /cypress\/included:cypress-\d+\.\d+\.\d+-node-[^\s\\]+/g
const PLAYWRIGHT_IMAGE_PATTERN = /mcr\.microsoft\.com\/playwright:v\d+\.\d+\.\d+-([a-z0-9.-]+)/g

const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const ciFileNames = readdirSync('gitlab-ci').filter(fileName => fileName.endsWith('.yml'))
const packageVersions = {
  Cypress: packageLock.packages['node_modules/cypress'].version,
  Playwright: packageLock.packages['node_modules/@playwright/test'].version,
}
const checks = [
  ['Cypress', CYPRESS_IMAGE_VERSION_PATTERN],
  ['Playwright', PLAYWRIGHT_IMAGE_VERSION_PATTERN],
]

if (argv.includes('--update')) {
  await updateCiImages()
}

checkCiImages()
stdout.write('Cypress and Playwright CI image versions match package-lock.json\n')

async function updateCiImages() {
  const cypressImage = await resolveCypressImage(packageVersions.Cypress)
  const replacements = [
    [CYPRESS_IMAGE_PATTERN, `cypress/included:${cypressImage}`],
    [PLAYWRIGHT_IMAGE_PATTERN, `mcr.microsoft.com/playwright:v${packageVersions.Playwright}-$1`],
  ]

  for (const fileName of ciFileNames) {
    const path = `gitlab-ci/${fileName}`
    const currentContent = readFileSync(path, 'utf8')
    const updatedContent = replacements.reduce(
      (content, [pattern, replacement]) => content.replace(pattern, replacement),
      currentContent,
    )

    if (updatedContent !== currentContent) {
      writeFileSync(path, updatedContent)
      stdout.write(`Updated ${path}\n`)
    }
  }
}

async function resolveCypressImage(cypressVersion) {
  const nodeVersion = readFileSync('.nvmrc', 'utf8').trim().replace(/^v/, '')
  const tagPrefix = `cypress-${cypressVersion}-node-${nodeVersion}-`
  const url = new URL('https://hub.docker.com/v2/repositories/cypress/included/tags')
  url.searchParams.set('name', cypressVersion)
  url.searchParams.set('page_size', '100')

  const response = await globalThis.fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load Cypress image tags: ${response.status} ${response.statusText}`)
  }

  const { results } = await response.json()
  const matchingTags = results
    .filter(({ name }) => name.startsWith(tagPrefix))
    .sort((left, right) => right.last_updated.localeCompare(left.last_updated))

  if (matchingTags.length === 0) {
    throw new Error(`No Cypress ${cypressVersion} image found for Node ${nodeVersion}`)
  }

  return matchingTags[0].name
}

function checkCiImages() {
  const ciConfig = ciFileNames
    .map(fileName => readFileSync(`gitlab-ci/${fileName}`, 'utf8'))
    .join('\n')

  for (const [name, imagePattern] of checks) {
    const packageVersion = packageVersions[name]
    const imageVersions = [...ciConfig.matchAll(imagePattern)].map(match => match[1])

    if (imageVersions.length === 0) {
      throw new Error(`No ${name} CI image found`)
    }

    if (imageVersions.some(imageVersion => imageVersion !== packageVersion)) {
      throw new Error(
        `${name} package version ${packageVersion} does not match CI image versions: ${imageVersions.join(', ')}\n`
        + 'Run "npm run e2e:image-versions:update" to update the CI images.',
      )
    }
  }
}
