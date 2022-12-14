declare module 'lnurl' {
  export class options {
    host: string
    port: string | number
    url: string
    lightning?: {
      backend: string
      config: unknown
    }
  }
  export class LnurlServer {
    on(event: string, callback: CallableFunction): void
    generateNewUrl(route: string): {
      encoded: string
      secret: string
      url: string
    }
  }
  export function createServer(options: options): LnurlServer
}
