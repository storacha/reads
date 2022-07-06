import anyTest from 'ava'

/**
 * @typedef {import('../../lib').IpfsGatewayRacer} IpfsGatewayRacer
 * @typedef {import('testcontainers').StartedTestContainer} StartedTestContainer
 * @typedef {import('ava').TestInterface<{gwRacer: IpfsGatewayRacer, container: StartedTestContainer}>} TestFn
 */

export const test = /** @type {TestFn} */ (anyTest)
