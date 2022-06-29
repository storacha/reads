export interface IpfsGatewayRacerOptions {
  timeout?: number
}

export interface IpfsGatewayRaceGetOptions {
  pathname?: string
  headers?: Headers
  notAbortRaceContestantsOnWinner?: boolean
  onRaceEnd?: (gwRequests: GatewayRequests[], winnerResponse: GatewayResponse | undefined) => void
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

// Gateway requests

export type GatewayRequests = Promise<GatewayResponse>
