# Changelog

## [1.2.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.2.0...edge-gateway-v1.2.1) (2022-09-27)


### Bug Fixes

* public gateways might give us invalid etags ([#79](https://github.com/web3-storage/reads/issues/79)) ([0717443](https://github.com/web3-storage/reads/commit/07174430389f4261d8cb378813e48e12185e03f2))

## [1.2.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.1.1...edge-gateway-v1.2.0) (2022-09-26)


### Features

* 2 tier race for edge gateway ([#78](https://github.com/web3-storage/reads/issues/78)) ([1661166](https://github.com/web3-storage/reads/commit/1661166708ee977ac07e58df17fe66ffde040574))
* adding google malware detection ([#36](https://github.com/web3-storage/reads/issues/36)) ([bacaeae](https://github.com/web3-storage/reads/commit/bacaeaea4d4610672b48c5d422100fccf78918ca))
* edge gateway with cid verifier behind env var ([#73](https://github.com/web3-storage/reads/issues/73)) ([d3ae9f6](https://github.com/web3-storage/reads/commit/d3ae9f65bab0b4f7843f2301f8ce2345c2d1e603))


### Bug Fixes

* edge gateway package denylist binding for cron ([#61](https://github.com/web3-storage/reads/issues/61)) ([7700f46](https://github.com/web3-storage/reads/commit/7700f4600cc481e9417cfb60a7d98718a9b56319))
* edge gateway should wait until cid verifier ([#63](https://github.com/web3-storage/reads/issues/63)) ([0cc74e3](https://github.com/web3-storage/reads/commit/0cc74e3c30402e40eb4a5237af460a6a267cc98a))
* edge gateway to provide only cid to cid provider post ([#75](https://github.com/web3-storage/reads/issues/75)) ([bf6e740](https://github.com/web3-storage/reads/commit/bf6e740e42a52c36782af887f771c97f307a334f))
* edge gateway to use denylist route ([#57](https://github.com/web3-storage/reads/issues/57)) ([ed7f418](https://github.com/web3-storage/reads/commit/ed7f41819a2fb1395f2d19fca7dfd242caf74abd))
* handle etag formats to get resource cid ([#58](https://github.com/web3-storage/reads/issues/58)) ([ee3d024](https://github.com/web3-storage/reads/commit/ee3d02492c8a005f2b214181f0b18c7b66b73d88))
* return value cid from etag ([#59](https://github.com/web3-storage/reads/issues/59)) ([1cdb6b7](https://github.com/web3-storage/reads/commit/1cdb6b7e6ee407ca190fd81d4b4eb13c1ec48e8a))
* revert pinata gateway removal ([#52](https://github.com/web3-storage/reads/issues/52)) ([db996d6](https://github.com/web3-storage/reads/commit/db996d6f15873d75d3d1434e0921fbf031a1a08b))

## [1.1.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.1.0...edge-gateway-v1.1.1) (2022-09-07)


### Bug Fixes

* temporary remove pinata ([#50](https://github.com/web3-storage/reads/issues/50)) ([afc6f80](https://github.com/web3-storage/reads/commit/afc6f804e99630bf0c40b9b54185db94efe8d86b))

## [1.1.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.5...edge-gateway-v1.1.0) (2022-09-07)


### Features

* use new pinata dedicated gateway ([#41](https://github.com/web3-storage/reads/issues/41)) ([f224bb4](https://github.com/web3-storage/reads/commit/f224bb447e77ffc5134bb5ae20633ddd2885eb74))

## [1.0.5](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.4...edge-gateway-v1.0.5) (2022-09-06)


### Bug Fixes

* add cid to local denylist ([#42](https://github.com/web3-storage/reads/issues/42)) ([814d96e](https://github.com/web3-storage/reads/commit/814d96e1c0b864c04f71405949ae5118fcd2b82f))
* stracktraces frames ([#47](https://github.com/web3-storage/reads/issues/47)) ([f134f63](https://github.com/web3-storage/reads/commit/f134f634e7b5ddbe4c5dd60f2f812ebb9081c053))

## [1.0.4](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.3...edge-gateway-v1.0.4) (2022-08-31)


### Bug Fixes

* edge gateway keep status code ([#38](https://github.com/web3-storage/reads/issues/38)) ([2947d8d](https://github.com/web3-storage/reads/commit/2947d8db435e2f4975cc3a2787a5203b92c7697e))
* worker routes with zone id ([#40](https://github.com/web3-storage/reads/issues/40)) ([3b8b210](https://github.com/web3-storage/reads/commit/3b8b210a7dfebd16766a574424cc39d15d2113ba))

## [1.0.3](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.2...edge-gateway-v1.0.3) (2022-08-12)


### Bug Fixes

* avoid storing counts for non defined status codes ([#34](https://github.com/web3-storage/reads/issues/34)) ([2927505](https://github.com/web3-storage/reads/commit/29275056c2f7dc3fc2c970fc03ed23e67cdcfc7e))

## [1.0.2](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.1...edge-gateway-v1.0.2) (2022-08-12)


### Bug Fixes

* use dag haus cf dedicated gw ([#32](https://github.com/web3-storage/reads/issues/32)) ([34c4b16](https://github.com/web3-storage/reads/commit/34c4b161e13bbb92b53eab3b60c985c4197d1fb6))

## [1.0.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.0.0...edge-gateway-v1.0.1) (2022-08-09)


### Bug Fixes

* docs for metrics ([024dc39](https://github.com/web3-storage/reads/commit/024dc39499529ad5af6f41acbf02e2f18c7c49d7))

## 1.0.0 (2022-08-04)


### Features

* add cron denylist ([#28](https://github.com/web3-storage/reads/issues/28)) ([cde085f](https://github.com/web3-storage/reads/commit/cde085f001888b61234447e09d159fce8a4367a4))
* add loki to edge gateway ([#13](https://github.com/web3-storage/reads/issues/13)) ([f6e0242](https://github.com/web3-storage/reads/commit/f6e0242822f2eff343dc5a82dd7a57a005dcb778))
* dotstorage layer only if cached gateways property ([#22](https://github.com/web3-storage/reads/issues/22)) ([8a7b0c0](https://github.com/web3-storage/reads/commit/8a7b0c0892444ce3c97d08de6854e963a71a9a7e))
* edge gateway ([#12](https://github.com/web3-storage/reads/issues/12)) ([a0c1d09](https://github.com/web3-storage/reads/commit/a0c1d09ea91b968fdb75caf5004a5fc2620c93a6))
* metrics ([#16](https://github.com/web3-storage/reads/issues/16)) ([5ff2903](https://github.com/web3-storage/reads/commit/5ff290348171a5fcd9a2dffcd1054fbb3df1443b))
* support base cid encodings ([#17](https://github.com/web3-storage/reads/issues/17)) ([2e41dc5](https://github.com/web3-storage/reads/commit/2e41dc5e2c8a333371f2abbc0ce176706df7509b))


### Bug Fixes

* sentry stack traces ([#19](https://github.com/web3-storage/reads/issues/19)) ([905f0ee](https://github.com/web3-storage/reads/commit/905f0eed8b1ce1937f02f2e11f403f736312b1cb))
* use json response from workers utils ([#21](https://github.com/web3-storage/reads/issues/21)) ([bdc78ab](https://github.com/web3-storage/reads/commit/bdc78ab9a416070b97fa4623b3d5e885c16bde65))
