# Changelog

## 1.0.0 (2024-09-20)


### Features

* 2 tier race for edge gateway ([#78](https://github.com/storacha/reads/issues/78)) ([1661166](https://github.com/storacha/reads/commit/1661166708ee977ac07e58df17fe66ffde040574))
* add configurable redirect ([#142](https://github.com/storacha/reads/issues/142)) ([cfb8798](https://github.com/storacha/reads/commit/cfb87986491fc6aef342ad6a76e5f13b248c8a49)), closes [#141](https://github.com/storacha/reads/issues/141)
* add cron denylist ([#28](https://github.com/storacha/reads/issues/28)) ([cde085f](https://github.com/storacha/reads/commit/cde085f001888b61234447e09d159fce8a4367a4))
* add different timeout for cdn gateway requests ([#153](https://github.com/storacha/reads/issues/153)) ([14702af](https://github.com/storacha/reads/commit/14702af9e4ecf983001b984a138289ff3de9f56e))
* add loki to edge gateway ([#13](https://github.com/storacha/reads/issues/13)) ([f6e0242](https://github.com/storacha/reads/commit/f6e0242822f2eff343dc5a82dd7a57a005dcb778))
* add support for gateway race configuration via wrangler secret ([#100](https://github.com/storacha/reads/issues/100)) ([3bf013f](https://github.com/storacha/reads/commit/3bf013f0b016792058f3175f9119a2312ce0a99e))
* adding basic authentication to cid-verifier ([#128](https://github.com/storacha/reads/issues/128)) ([b8b9c94](https://github.com/storacha/reads/commit/b8b9c947cdab5573ee28c3bbf5da06db7e5a8f55)), closes [#66](https://github.com/storacha/reads/issues/66)
* adding google malware detection ([#36](https://github.com/storacha/reads/issues/36)) ([bacaeae](https://github.com/storacha/reads/commit/bacaeaea4d4610672b48c5d422100fccf78918ca))
* dotstorage hosts resolution layer ([#105](https://github.com/storacha/reads/issues/105)) ([f24d290](https://github.com/storacha/reads/commit/f24d290d5737fbcae35582a7cc69b24d00853563))
* dotstorage layer only if cached gateways property ([#22](https://github.com/storacha/reads/issues/22)) ([8a7b0c0](https://github.com/storacha/reads/commit/8a7b0c0892444ce3c97d08de6854e963a71a9a7e))
* edge gateway ([#12](https://github.com/storacha/reads/issues/12)) ([a0c1d09](https://github.com/storacha/reads/commit/a0c1d09ea91b968fdb75caf5004a5fc2620c93a6))
* edge gateway with cid verifier behind env var ([#73](https://github.com/storacha/reads/issues/73)) ([d3ae9f6](https://github.com/storacha/reads/commit/d3ae9f65bab0b4f7843f2301f8ce2345c2d1e603))
* fast 304 for `if-none-match` requests ([#120](https://github.com/storacha/reads/issues/120)) ([389d652](https://github.com/storacha/reads/commit/389d652392fe0ce4df24873d1dfe18eef68f9374))
* log anchor ([#98](https://github.com/storacha/reads/issues/98)) ([26351cd](https://github.com/storacha/reads/commit/26351cdcca7fab939d5282b8f81994b3ced15ff3))
* metrics ([#16](https://github.com/storacha/reads/issues/16)) ([5ff2903](https://github.com/storacha/reads/commit/5ff290348171a5fcd9a2dffcd1054fbb3df1443b))
* support base cid encodings ([#17](https://github.com/storacha/reads/issues/17)) ([2e41dc5](https://github.com/storacha/reads/commit/2e41dc5e2c8a333371f2abbc0ce176706df7509b))
* support perma cache fetch disabled via env var ([#154](https://github.com/storacha/reads/issues/154)) ([164c177](https://github.com/storacha/reads/commit/164c177e8e4e175d0e0608b1910b94d71240a57d))
* track layer resolution header ([#103](https://github.com/storacha/reads/issues/103)) ([08f3a6d](https://github.com/storacha/reads/commit/08f3a6dd48f6368ddff2f04eaf645b60680b35d4))
* use new pinata dedicated gateway ([#41](https://github.com/storacha/reads/issues/41)) ([f224bb4](https://github.com/storacha/reads/commit/f224bb447e77ffc5134bb5ae20633ddd2885eb74))
* using denylist from edge-gateway ([#126](https://github.com/storacha/reads/issues/126)) ([22c0123](https://github.com/storacha/reads/commit/22c012362ba15ac5f2ec6547374622c8c5e60302))


### Bug Fixes

* abort race contestants when all fulfill ([#48](https://github.com/storacha/reads/issues/48)) ([60163c2](https://github.com/storacha/reads/commit/60163c27eef8135ceef62c9ce478ffee6eb0f902))
* add cid to local denylist ([#42](https://github.com/storacha/reads/issues/42)) ([814d96e](https://github.com/storacha/reads/commit/814d96e1c0b864c04f71405949ae5118fcd2b82f))
* add kv bindings for denylist in edge gateway ([#136](https://github.com/storacha/reads/issues/136)) ([97dcbe2](https://github.com/storacha/reads/commit/97dcbe2ecfa214357d5ca805073bebe4363df6b0))
* avoid storing counts for non defined status codes ([#34](https://github.com/storacha/reads/issues/34)) ([2927505](https://github.com/storacha/reads/commit/29275056c2f7dc3fc2c970fc03ed23e67cdcfc7e))
* denylist needs to move to other package ([#150](https://github.com/storacha/reads/issues/150)) ([6eb9b3f](https://github.com/storacha/reads/commit/6eb9b3f99bb62ba0158c417623f0e98cf9a82ee2))
* disable cid verifier in staging ([#115](https://github.com/storacha/reads/issues/115)) ([674d1c1](https://github.com/storacha/reads/commit/674d1c120a3a340b924cb804f6a424fffc344978))
* docs for metrics ([024dc39](https://github.com/storacha/reads/commit/024dc39499529ad5af6f41acbf02e2f18c7c49d7))
* dotstorage race requests should receive original request headers ([#112](https://github.com/storacha/reads/issues/112)) ([f10bee1](https://github.com/storacha/reads/commit/f10bee18630304dc80b78b859978826ab539cd0b))
* edge gateway cache freeway response ([#143](https://github.com/storacha/reads/issues/143)) ([c587987](https://github.com/storacha/reads/commit/c587987671e93211421418bf38f5d11ba60a3e5e))
* edge gateway error when only if cached request fails ([#109](https://github.com/storacha/reads/issues/109)) ([1a4cca0](https://github.com/storacha/reads/commit/1a4cca08701088e78f68d1e88a08479775b0a477)), closes [#108](https://github.com/storacha/reads/issues/108)
* edge gateway keep status code ([#38](https://github.com/storacha/reads/issues/38)) ([2947d8d](https://github.com/storacha/reads/commit/2947d8db435e2f4975cc3a2787a5203b92c7697e))
* edge gateway package denylist binding for cron ([#61](https://github.com/storacha/reads/issues/61)) ([7700f46](https://github.com/storacha/reads/commit/7700f4600cc481e9417cfb60a7d98718a9b56319))
* edge gateway should wait until cid verifier ([#63](https://github.com/storacha/reads/issues/63)) ([0cc74e3](https://github.com/storacha/reads/commit/0cc74e3c30402e40eb4a5237af460a6a267cc98a))
* edge gateway to provide only cid to cid provider post ([#75](https://github.com/storacha/reads/issues/75)) ([bf6e740](https://github.com/storacha/reads/commit/bf6e740e42a52c36782af887f771c97f307a334f))
* edge gateway to use denylist route ([#57](https://github.com/storacha/reads/issues/57)) ([ed7f418](https://github.com/storacha/reads/commit/ed7f41819a2fb1395f2d19fca7dfd242caf74abd))
* end error response should be gateway timeout or bad gateway ([#99](https://github.com/storacha/reads/issues/99)) ([f7e67df](https://github.com/storacha/reads/commit/f7e67dffb2c952e0020b6e408a473cb2df6461e4))
* error handling on race ([#82](https://github.com/storacha/reads/issues/82)) ([6555ae4](https://github.com/storacha/reads/commit/6555ae4342db8f66ba1e2e382cbc08394d7224ba))
* handle etag formats to get resource cid ([#58](https://github.com/storacha/reads/issues/58)) ([ee3d024](https://github.com/storacha/reads/commit/ee3d02492c8a005f2b214181f0b18c7b66b73d88))
* not abort when no winner ([#95](https://github.com/storacha/reads/issues/95)) ([5a286c1](https://github.com/storacha/reads/commit/5a286c1796d0cb19cdef231ab1d312f1b5d73be4))
* org slug ([65b8494](https://github.com/storacha/reads/commit/65b849482cc02e75f3d081267bd89af7ff09a4dd))
* proxying request query search (fixes [#133](https://github.com/storacha/reads/issues/133)) ([#137](https://github.com/storacha/reads/issues/137)) ([9f8c477](https://github.com/storacha/reads/commit/9f8c4773753b29e4bc36dd52ae0d67d18690b7c8))
* public gateways might give us invalid etags ([#79](https://github.com/storacha/reads/issues/79)) ([0717443](https://github.com/storacha/reads/commit/07174430389f4261d8cb378813e48e12185e03f2))
* remove legacy binding from prod ([9bac59d](https://github.com/storacha/reads/commit/9bac59d0e7b0f11fd1364c3127c64ffc6bd7d0f5))
* remove legacy binding from staging ([e3a9767](https://github.com/storacha/reads/commit/e3a9767974258f50cc42ef63dae6f68c75e57385))
* remove unused env var ([177ac95](https://github.com/storacha/reads/commit/177ac95c44e61356e6658013d3359880663c8f13))
* return value cid from etag ([#59](https://github.com/storacha/reads/issues/59)) ([1cdb6b7](https://github.com/storacha/reads/commit/1cdb6b7e6ee407ca190fd81d4b4eb13c1ec48e8a))
* revert pinata gateway removal ([#52](https://github.com/storacha/reads/issues/52)) ([db996d6](https://github.com/storacha/reads/commit/db996d6f15873d75d3d1434e0921fbf031a1a08b))
* sentry stack traces ([#19](https://github.com/storacha/reads/issues/19)) ([905f0ee](https://github.com/storacha/reads/commit/905f0eed8b1ce1937f02f2e11f403f736312b1cb))
* status code when in denylist ([#160](https://github.com/storacha/reads/issues/160)) ([35c0123](https://github.com/storacha/reads/commit/35c01238c63ba1d0d6cc274258d23c82681bdbbf))
* stracktraces frames ([#47](https://github.com/storacha/reads/issues/47)) ([f134f63](https://github.com/storacha/reads/commit/f134f634e7b5ddbe4c5dd60f2f812ebb9081c053))
* stricter requirements for cache ([#178](https://github.com/storacha/reads/issues/178)) ([3dc5c15](https://github.com/storacha/reads/commit/3dc5c15a5640411628431b03110d81dd68e21120))
* temporary remove pinata ([#50](https://github.com/storacha/reads/issues/50)) ([afc6f80](https://github.com/storacha/reads/commit/afc6f804e99630bf0c40b9b54185db94efe8d86b))
* use dag haus cf dedicated gw ([#32](https://github.com/storacha/reads/issues/32)) ([34c4b16](https://github.com/storacha/reads/commit/34c4b161e13bbb92b53eab3b60c985c4197d1fb6))
* use json response from workers utils ([#21](https://github.com/storacha/reads/issues/21)) ([bdc78ab](https://github.com/storacha/reads/commit/bdc78ab9a416070b97fa4623b3d5e885c16bde65))
* worker routes with zone id ([#40](https://github.com/storacha/reads/issues/40)) ([3b8b210](https://github.com/storacha/reads/commit/3b8b210a7dfebd16766a574424cc39d15d2113ba))

## [1.12.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.12.0...edge-gateway-v1.12.1) (2023-06-02)


### Bug Fixes

* status code when in denylist ([#160](https://github.com/web3-storage/reads/issues/160)) ([35c0123](https://github.com/web3-storage/reads/commit/35c01238c63ba1d0d6cc274258d23c82681bdbbf))

## [1.12.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.11.0...edge-gateway-v1.12.0) (2023-05-12)


### Features

* support perma cache fetch disabled via env var ([#154](https://github.com/web3-storage/reads/issues/154)) ([164c177](https://github.com/web3-storage/reads/commit/164c177e8e4e175d0e0608b1910b94d71240a57d))

## [1.11.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.10.1...edge-gateway-v1.11.0) (2023-03-30)


### Features

* add different timeout for cdn gateway requests ([#153](https://github.com/web3-storage/reads/issues/153)) ([14702af](https://github.com/web3-storage/reads/commit/14702af9e4ecf983001b984a138289ff3de9f56e))


### Bug Fixes

* denylist needs to move to other package ([#150](https://github.com/web3-storage/reads/issues/150)) ([6eb9b3f](https://github.com/web3-storage/reads/commit/6eb9b3f99bb62ba0158c417623f0e98cf9a82ee2))

## [1.10.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.10.0...edge-gateway-v1.10.1) (2023-03-13)


### Bug Fixes

* edge gateway error when only if cached request fails ([#109](https://github.com/web3-storage/reads/issues/109)) ([1a4cca0](https://github.com/web3-storage/reads/commit/1a4cca08701088e78f68d1e88a08479775b0a477)), closes [#108](https://github.com/web3-storage/reads/issues/108)

## [1.10.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.9.3...edge-gateway-v1.10.0) (2023-03-07)


### Features

* add configurable redirect ([#142](https://github.com/web3-storage/reads/issues/142)) ([cfb8798](https://github.com/web3-storage/reads/commit/cfb87986491fc6aef342ad6a76e5f13b248c8a49)), closes [#141](https://github.com/web3-storage/reads/issues/141)

## [1.9.3](https://github.com/web3-storage/reads/compare/edge-gateway-v1.9.2...edge-gateway-v1.9.3) (2023-03-03)


### Bug Fixes

* remove legacy binding from prod ([9bac59d](https://github.com/web3-storage/reads/commit/9bac59d0e7b0f11fd1364c3127c64ffc6bd7d0f5))

## [1.9.2](https://github.com/web3-storage/reads/compare/edge-gateway-v1.9.1...edge-gateway-v1.9.2) (2023-03-03)


### Bug Fixes

* edge gateway cache freeway response ([#143](https://github.com/web3-storage/reads/issues/143)) ([c587987](https://github.com/web3-storage/reads/commit/c587987671e93211421418bf38f5d11ba60a3e5e))
* remove legacy binding from staging ([e3a9767](https://github.com/web3-storage/reads/commit/e3a9767974258f50cc42ef63dae6f68c75e57385))

## [1.9.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.9.0...edge-gateway-v1.9.1) (2023-02-07)


### Bug Fixes

* proxying request query search (fixes [#133](https://github.com/web3-storage/reads/issues/133)) ([#137](https://github.com/web3-storage/reads/issues/137)) ([9f8c477](https://github.com/web3-storage/reads/commit/9f8c4773753b29e4bc36dd52ae0d67d18690b7c8))

## [1.9.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.8.0...edge-gateway-v1.9.0) (2022-12-21)


### Features

* using denylist from edge-gateway ([#126](https://github.com/web3-storage/reads/issues/126)) ([22c0123](https://github.com/web3-storage/reads/commit/22c012362ba15ac5f2ec6547374622c8c5e60302))


### Bug Fixes

* add kv bindings for denylist in edge gateway ([#136](https://github.com/web3-storage/reads/issues/136)) ([97dcbe2](https://github.com/web3-storage/reads/commit/97dcbe2ecfa214357d5ca805073bebe4363df6b0))

## [1.8.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.7.0...edge-gateway-v1.8.0) (2022-12-16)


### Features

* adding basic authentication to cid-verifier ([#128](https://github.com/web3-storage/reads/issues/128)) ([b8b9c94](https://github.com/web3-storage/reads/commit/b8b9c947cdab5573ee28c3bbf5da06db7e5a8f55)), closes [#66](https://github.com/web3-storage/reads/issues/66)

## [1.7.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.6.3...edge-gateway-v1.7.0) (2022-12-16)


### Features

* fast 304 for `if-none-match` requests ([#120](https://github.com/web3-storage/reads/issues/120)) ([389d652](https://github.com/web3-storage/reads/commit/389d652392fe0ce4df24873d1dfe18eef68f9374))

## [1.6.3](https://github.com/web3-storage/reads/compare/edge-gateway-v1.6.2...edge-gateway-v1.6.3) (2022-11-08)


### Bug Fixes

* end error response should be gateway timeout or bad gateway ([#99](https://github.com/web3-storage/reads/issues/99)) ([f7e67df](https://github.com/web3-storage/reads/commit/f7e67dffb2c952e0020b6e408a473cb2df6461e4))

## [1.6.2](https://github.com/web3-storage/reads/compare/edge-gateway-v1.6.1...edge-gateway-v1.6.2) (2022-11-07)


### Bug Fixes

* disable cid verifier in staging ([#115](https://github.com/web3-storage/reads/issues/115)) ([674d1c1](https://github.com/web3-storage/reads/commit/674d1c120a3a340b924cb804f6a424fffc344978))

## [1.6.1](https://github.com/web3-storage/reads/compare/edge-gateway-v1.6.0...edge-gateway-v1.6.1) (2022-10-25)


### Bug Fixes

* dotstorage race requests should receive original request headers ([#112](https://github.com/web3-storage/reads/issues/112)) ([f10bee1](https://github.com/web3-storage/reads/commit/f10bee18630304dc80b78b859978826ab539cd0b))

## [1.6.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.5.0...edge-gateway-v1.6.0) (2022-10-21)


### Features

* log anchor ([#98](https://github.com/web3-storage/reads/issues/98)) ([26351cd](https://github.com/web3-storage/reads/commit/26351cdcca7fab939d5282b8f81994b3ced15ff3))

## [1.5.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.4.0...edge-gateway-v1.5.0) (2022-10-18)


### Features

* dotstorage hosts resolution layer ([#105](https://github.com/web3-storage/reads/issues/105)) ([f24d290](https://github.com/web3-storage/reads/commit/f24d290d5737fbcae35582a7cc69b24d00853563))

## [1.4.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.3.0...edge-gateway-v1.4.0) (2022-10-14)


### Features

* track layer resolution header ([#103](https://github.com/web3-storage/reads/issues/103)) ([08f3a6d](https://github.com/web3-storage/reads/commit/08f3a6dd48f6368ddff2f04eaf645b60680b35d4))

## [1.3.0](https://github.com/web3-storage/reads/compare/edge-gateway-v1.2.4...edge-gateway-v1.3.0) (2022-10-13)


### Features

* add support for gateway race configuration via wrangler secret ([#100](https://github.com/web3-storage/reads/issues/100)) ([3bf013f](https://github.com/web3-storage/reads/commit/3bf013f0b016792058f3175f9119a2312ce0a99e))

## [1.2.4](https://github.com/web3-storage/reads/compare/edge-gateway-v1.2.3...edge-gateway-v1.2.4) (2022-10-11)


### Bug Fixes

* not abort when no winner ([#95](https://github.com/web3-storage/reads/issues/95)) ([5a286c1](https://github.com/web3-storage/reads/commit/5a286c1796d0cb19cdef231ab1d312f1b5d73be4))

## [1.2.3](https://github.com/web3-storage/reads/compare/edge-gateway-v1.2.2...edge-gateway-v1.2.3) (2022-10-11)


### Bug Fixes

* abort race contestants when all fulfill ([#48](https://github.com/web3-storage/reads/issues/48)) ([60163c2](https://github.com/web3-storage/reads/commit/60163c27eef8135ceef62c9ce478ffee6eb0f902))

## [1.2.2](https://github.com/web3-storage/reads/compare/edge-gateway-v1.2.1...edge-gateway-v1.2.2) (2022-10-07)


### Bug Fixes

* error handling on race ([#82](https://github.com/web3-storage/reads/issues/82)) ([6555ae4](https://github.com/web3-storage/reads/commit/6555ae4342db8f66ba1e2e382cbc08394d7224ba))

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
