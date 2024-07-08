import { vi } from 'vitest'

export const regexLnurlW = /withdraw\/api\/v1\/links\/(?<id>[a-zA-Z0-9-]+)/

let counter = 123
const createId = () => `lnurlW${++counter}`
const createResponse = (data: unknown) => ({ data })

vi.mock('axios', () => ({
  default: {
    get(url: string) {
      if (url.match(regexLnurlW)) {
        return createResponse({
          id: url.match(regexLnurlW)?.groups?.id,
          wallet: 'someWallet',
          title: 'This is the card text',
          min_withdrawable: 1000,
          max_withdrawable: 1000,
          uses: 1,
          wait_time: 120,
          is_unique: true,
          unique_hash: 'someuniquehash',
          k1: 'somek1',
          open_time: + new Date() / 1000,
          used: 0,
          usescsv: '0',
          number: 0,
          webhook_url: 'https://test.tipcards.io',
          webhook_headers: null,
          webhook_body: null,
          custom_url: null,
          lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
        })
      }

      return null
    },
    post(url: string, data: object) {
      if (url.includes('/withdraw/api/v1/links')) {
        return createResponse({
          ...data,
          id: createId(),
          wallet: 'someWallet',
          unique_hash: 'someuniquehash',
          k1: 'somek1',
          open_time: + new Date() / 1000,
          used: 0,
          usescsv: '0',
          number: 0,
          webhook_headers: null,
          webhook_body: null,
          custom_url: null,
          lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
        })
      }

      return null
    },
    put(url: string, data: object) {
      if (url.match(regexLnurlW)) {
        return createResponse({
          ...data,
          id: url.match(regexLnurlW)?.groups?.id,
          wallet: 'someWallet',
          unique_hash: 'someuniquehash',
          k1: 'somek1',
          open_time: + new Date() / 1000,
          used: 0,
          usescsv: '0',
          number: 0,
          webhook_headers: null,
          webhook_body: null,
          custom_url: null,
          lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
        })
      }

      return null
    },
    delete() {
      return createResponse({ status: 'success' })
    },
  },
}))
