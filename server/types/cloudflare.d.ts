declare module 'h3' {
  interface H3EventContext {
    cf: CfProperties
    cloudflare: {
      request: Request
      env: {}
      context: ExecutionContext
    }
  }
}

export default {}
