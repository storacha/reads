export interface IpfsGatewayRacerOptions {
  timeout?: number
}

export interface IpfsGatewayRaceGetOptions {
  method?: string
  pathname?: string
  search?: string
  headers?: Headers
  noAbortRequestsOnWinner?: boolean
  onRaceEnd?: (gatewayResponsePromises: GatewayResponsePromise[], winnerResponse: GatewayResponse | undefined) => void
  gatewaySignals?: Record<string, AbortSignal>
  IdentityTransformStream?: typeof TransformStream
}

// Gateway Race Responses

interface GatewayResponseSuccess {
  response: Response
  url: string
}

interface GatewayResponseFailure {
  response?: Response
  url: string
  reason: string
  aborted: boolean
}

export type GatewayResponse = GatewayResponseFailure | GatewayResponseSuccess

export type GatewayResponsePromise = Promise<GatewayResponse>
