import { JSONResponse } from '@web3-storage/worker-utils/response'

/**
 * Get edge gateway API version information.
 *
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function versionGet (request, env) {
  return new JSONResponse({
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH,
    raceGatewaysL1: env.ipfsGatewaysL1,
    raceGatewaysL2: env.ipfsGatewaysL2,
    ipfsGatewayRedirectHostname: env.ipfsGatewayRedirectHostname
  })
}
