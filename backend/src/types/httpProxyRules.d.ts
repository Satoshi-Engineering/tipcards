declare module 'http-proxy-rules' {
  export default class HttpProxyRules {
    constructor(options: { rules: Record<string, string>, default?: string })
    match(req: http.IncomingMessage): string | null
  }
}
