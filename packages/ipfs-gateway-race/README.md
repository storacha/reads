# ipfs-gateway-race

## Install

```console
npm install ipfs-gateway-race
```

## Usage

Import the library in your application and create a gateway racer like:

```js
import { createGatewayRacer } from 'ipfs-gateway-race'

const gwRacer = createGatewayRacer(
  ['https://ipfs.io', 'https://cf-ipfs.com']
)
```

## Get

> Get IPFS response by given CID.

```ts
interface IpfsGatewayRaceGetOptions {
  pathname?: string
  headers?: Headers
  noAbortRequestsOnWinner?: boolean
  onRaceEnd?: (gwResponsePromises: GatewayResponsePromise[], winnerResponse: GatewayResponse | undefined) => void
}

get(cid: string,  options: IpfsGatewayRaceGetOptions): Promise<Response>
```

Example:

```js
import { createGatewayRacer } from 'ipfs-gateway-race'

const gwRacer = createGatewayRacer(
  ['https://ipfs.io', 'https://cf-ipfs.com']
)

const response = await gwRacer.get(
  'bafybeiedv7sowwxamly4oicivudp45rsfvbklnf3fvbvonxrwoxqylhtwq',
  {
    pathname: '/0.json'
  }
)
```

## Contributing

Feel free to join in. All welcome. [Open an issue](https://github.com/storacha/reads/issues)!

If you're opening a pull request, please see the [guidelines in DEVELOPMENT.md](https://github.com/storacha/reads/blob/main/DEVELOPMENT.md#how-should-i-write-my-commits) on structuring your commit messages so that your PR will be compatible with our [release process](https://github.com/storacha/reads/blob/main/DEVELOPMENT.md#release).

## License

Dual-licensed under [MIT + Apache 2.0](https://github.com/storacha/reads/blob/main/LICENSE.md)
