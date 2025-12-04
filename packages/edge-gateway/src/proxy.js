/**
 * @param {Request} request
 * @param {import("./bindings").Env} env
 */
export const proxyGet = async (request, env) => {
  const { pathname, search } = new URL(request.url)
  for (const endpoint of env.cdnGateways) {
    const url = new URL(`${pathname}${search}`, endpoint)
    try {
      const res = await fetch(url.toString(), { headers: request.headers })
      if (res.ok) return res
    } catch (err) {
      console.error(`proxying GET ${url}`, err)
    }
  }
}
