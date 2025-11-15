declare module 'h3' {
  interface H3EventContext {
    cf: CfProperties
    cloudflare: {
      request: Request
      env: Cloudflare.Env
      context: ExecutionContext
    }
  }
}

export default {}
