import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { argv, stdout } from 'node:process'

const PLAYWRIGHT_IMAGE_VERSION_PATTERN = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-/g
const PLAYWRIGHT_IMAGE_PATTERN = /mcr\.microsoft\.com\/playwright:v\d+\.\d+\.\d+-([a-z0-9.-]+)/g

const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const ciFileNames = readdirSync('gitlab-ci').filter(fileName => fileName.endsWith('.yml'))
const packageVersions = {
  Playwright: packageLock.packages['node_modules/@playwright/test'].version,
}
const checks = [
  ['Playwright', PLAYWRIGHT_IMAGE_VERSION_PATTERN],
]

if (argv.includes('--update')) {
  await updateCiImages()
}

checkCiImages()
stdout.write('Playwright CI image versions match package-lock.json\n')

async function updateCiImages() {
  const replacements = [
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
