require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

// describe('Legacy API', () => {
//   it('should return valid rawTransaction', async () => {
//     const privateKey = '0xf07e85ad4c968e3f2552d56deeb99808e57d7d042cad49a3b372ff4737f053ae'
//     const transaction = {
//       from: '0x7b79b341dd28ae4c2be20fe685b704563e5a6763',
//       to: '0xba7bba580236935698782b600b28510e4d81d3ba',
//       nonce: '0x5',
//       gasPrice: '0x0',
//       gas: '0x2625a0',
//       value: '0x1',
//       data: '0x',
//       chainId: '2018',
//     }
//
//     const result = await caver.klay.accounts.signTransaction(transaction, privateKey)
//     // expect(result.rawTransaction).to.equal('0x' + 'f8658080832625a094ba7bba580236935698782b600b28510e4d81d3ba85174876e8008025a005b46e4be89f4b67867dae4f2c27740197d036e0fd888f972cd62a90a68b57a8a0432dbe75c52c5329ea9dd5917cb16d638fb850e836a360e1c9b141a0a7e43778')
//     caver.klay.sendSignedTransaction(result.rawTransaction)
//       .on('transactionHash', console.log)
//       .on('receipt', console.log)
//       .on('error', console.log)
//   })
// })

// describe('Value Transfer API', () => {
//   context('input: account key public', () => {
//     it('should return valid rawTransaction', async () => {
//       // const privateKey = '0xf07e85ad4c968e3f2552d56deeb99808e57d7d042cad49a3b372ff4737f053ae'
//       const privateKey = '0xd65707309738614bdc329bfaf7614fa70e1393c15ca3f4a4329a12870142bc26'
//       // let transaction = {
//       //   type: 'VALUE_TRANFSER',
//       //   from: '0x7b79b341dd28ae4c2be20fe685b704563e5a6763',
//       //   to: '0xEDd05E462158Cc7312372632E4Ad9234dEb7BfEe',
//       //   nonce: '0x9',
//       //   gasPrice: '0x0',
//       //   gas: '0x2625a0',
//       //   value: '0x2000',
//       //   chainId: '2018',
//       // }
//       let transaction = {
//         type: 'VALUE_TRANFSER',
//         from: '0x6d1339Eb9CB5be1705B63EFD193408A3451aB039',
//         to: '0xAdc7cAa4Ac2eD7DE91CEB3f159D5F826B2c58eBF',
//         nonce: '0x2',
//         gasPrice: '0x19',
//         gas: '0x2625a0',
//         value: '0x989680',
//         chainId: '0x1',
//       }
//
//       transaction = helpers.formatters.inputCallFormatter(transaction)
//
//       // console.log(transaction, 'transaction')
//
//       // caver.klay.accounts.wallet.add(privateKey)
//       // caver.klay.sendTransaction(transaction)
//       //   .on('transactionHash', console.log)
//       //   .on('receipt', console.log)
//       //   .on('error', console.log)
//
//       // const SigRLP = caver.klay.accounts.encodeRLPByTxType(transaction)
//       // const SigHash = caver.utils.sha3(SigRLP)
//       const result = await caver.klay.accounts.signTransaction(transaction, privateKey)
//       console.log(result, 'result')
//       // expect(SigRLP).to.equal('0x' + 'f83910f40280832625a094edd05e462158cc7312372632e4ad9234deb7bfee839896809452b2ce535cd695b8455bc37b86a00ed00de1a739018080')
//       // expect(SigHash).to.equal('0x' + 'd0319ce67b63a3060ceb51889e43e81614e96c696a40ee9380a29e9fb2d9feb1')
//       // expect(result.rawTransaction).to.equal('0x' + '10f879f8770280832625a094edd05e462158cc7312372632e4ad9234deb7bfee839896809452b2ce535cd695b8455bc37b86a00ed00de1a73925a0508af717d522d4c062e564248684dd03a3bd4ddbd37b052be7d5a57ffa4c433aa06c400ce2cffd9803f8f69376a5a96a04fcac1a24b88475637327b8924126751e')
//       // caver.klay.sendSignedTransaction(result.rawTransaction)
//       //   .on('transactionHash', console.log)
//       //   .on('receipt', console.log)
//       //   .on('error', console.log)
//     })
//   })
// })

// describe('Account creation API', () => {
//   context('input:: accountKeyType: public, humanReadable: false', () => {
//     it.each([
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0xD3C902559655E4932C807f8cb390bab835029Df6',
//             to: '0x2Ca699C367b461c07cAFfB40099AF86bdFe6F9cd',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             chainId: '0x1',
//             publicKey: '0x8e8f0da25d2fe9b47adf0684a26e5f5a5c293baf88b3f2c5981137a98aa5f3964050057834ea3f5e3873efc9022c1e4f03ba2795baba086d28f7e1af5330c566',
//           },
//           '0xed34b0cf47a0021e9897760f0a904a69260c2f638e0bcc805facb745ec3ff9ab',
//           '0x20f8c08080832625a0942ca699c367b461c07caffb40099af86bdfe6f9cd8405f5e10094d3c902559655e4932c807f8cb390bab835029df680b84501f842a08e8f0da25d2fe9b47adf0684a26e5f5a5c293baf88b3f2c5981137a98aa5f396a04050057834ea3f5e3873efc9022c1e4f03ba2795baba086d28f7e1af5330c56625a09c7ff7f99775ee1eb79b4eff3d9d9e946b3ebc0ab1a66e0eaf952f4ad9a30436a075befa1e2536e621058e17785fc3244be67d0435923e77f767978bc2d3a1bfb2',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0xf479cEE42c9A37bbc93C5b305dB8CfA63216e624',
//             to: '0xe6376aD9c9078Aba96ce839f61c6fEE00E03f9CA',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             chainId: '0x1',
//             publicKey: '0xb0659cfb1c839881418c4b8d9c0698fcb714d1b177cc959dee0bf72a88a4e8fe71d9172ba5efd419a57ec03b902628e0ffaec14fd533dbd89d14b2eb0b43113a',
//           },
//           '0x1da6dfcb52128060cdd2108edb786ca0aff4ef1fa537574286eeabe5c2ebd5ca',
//           '0x20f8bf8080832625a094e6376ad9c9078aba96ce839f61c6fee00e03f9ca8405f5e10094f479cee42c9a37bbc93c5b305db8cfa63216e62480b84501f842a0b0659cfb1c839881418c4b8d9c0698fcb714d1b177cc959dee0bf72a88a4e8fea071d9172ba5efd419a57ec03b902628e0ffaec14fd533dbd89d14b2eb0b43113a269f6acbee196d03a7e2de45638fa4bf7e4dcada895950321feb1095b1b60f0e6da01f17a52b129409e3f5caffb2748ec827abebc3ec2b9ccd077db01f2053826d45',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0x8778096E407eF25a0D3b90fd42107947d383B7c4',
//             to: '0x94470cb20c89f88e0A0a7150eFa3C67704DBC13B',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             chainId: '0x1',
//             publicKey: '0xe1d92e1f467d1f7ff4bdaad7a8d639e74a03235802cee853c2a9c28fc86a06001af47b1e60c15e865582df053fd28cc3eb15e420936fbac9068b6ead53f40fe1',
//           },
//           '0x12c0c69690a8b587d6f5698d7b5ab40effc2abddc80078d9f21cf73f3959266a',
//           '0x20f8c08080832625a09494470cb20c89f88e0a0a7150efa3c67704dbc13b8405f5e100948778096e407ef25a0d3b90fd42107947d383b7c480b84501f842a0e1d92e1f467d1f7ff4bdaad7a8d639e74a03235802cee853c2a9c28fc86a0600a01af47b1e60c15e865582df053fd28cc3eb15e420936fbac9068b6ead53f40fe125a045855d9b416cb2e99396e30123fe6f45bad7ca41dc4ebf1e7c21fe70c43c6270a070f97464dae1fed16cfd77fbc6a263d6286ef5b9edbd0e90de301e493becf643',
//         ],
//       ],
//       'should match with expected rawTransaction',
//       async ([txObject, privateKey, expected]) => {
//         const data = await caver.klay.accounts.signTransaction(txObject, privateKey)
//         expect(data.rawTransaction).to.be.equal(expected)
//       }
//     )
//   })
//
//   context('input:: accountKeyType: public, humanReadable: true', () => {
//     it.each([
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0xE4Ed2A694Df8caD2933a649D638D05130F9a7510',
//             to: '0x636F6C696e000000000000000000000000000000',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//             publicKey: '0x858952b80b6edf17910fea24ae3e40cf5d08e94d8fbb0b4a2b3ca3182b78fcf3a74e6fa16aaf561609550fb2f0517ddc14076fe28f444dc1a90c75bf42c561bf',
//           },
//           '0x52b732b7985892d394bb26f00266ca5c8ea194c506ebe7132da92f651f124946',
//           '0x20f8c08080832625a094636f6c696e0000000000000000000000000000008405f5e10094e4ed2a694df8cad2933a649d638d05130f9a751001b84501f842a0858952b80b6edf17910fea24ae3e40cf5d08e94d8fbb0b4a2b3ca3182b78fcf3a0a74e6fa16aaf561609550fb2f0517ddc14076fe28f444dc1a90c75bf42c561bf26a0a8bda3812d9fdc846a73e0daac29709bd8133b1f0f4ac583066ebfaf7f02f633a056439cb20675ad3c54a75b7a456a03430bd28f30fbeef050d2c8bc87641c8fde',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0x857bd3B7B945BE96392B4AA839B6733645C3b9Fd',
//             to: '0x636F6C696e000000000000000000000000000000',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//             publicKey: '0xf201ccc2778a9e554611adcf43fe726d73f648b6a966d285bc49798b3dee0d5717b334c9c9872ab262dd651bab132d3407b2e3ca5c3c32062e07ed51faf2272e'
//           },
//           '0xfb9124f7e6e1b1f6ac93fb5dcceb859b966ddd76578d3d49511ab32184563079',
//           '0x20f8c08080832625a094636f6c696e0000000000000000000000000000008405f5e10094857bd3b7b945be96392b4aa839b6733645c3b9fd01b84501f842a0f201ccc2778a9e554611adcf43fe726d73f648b6a966d285bc49798b3dee0d57a017b334c9c9872ab262dd651bab132d3407b2e3ca5c3c32062e07ed51faf2272e26a0f0257a6726593dd63f0ac2d139c3a1f4986fb0b03e610ae37b58f1f8ce7deb60a04cd80ec014981db2c4b520bd359d79de6aa2765c977c95aace89d03fb697b316',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from: '0x23B03C27328Fc8936331625F4c112a40f71D34f5',
//             to: '0x636F6C696e000000000000000000000000000000',
//             nonce: '0x0',
//             gasPrice: '0x0',
//             gas: '0x2625a0',
//             value: '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//             publicKey: '0xa7af570ade34f155a3817568a1268cc99aefde12cf5f75f2c556e3fcdac1d54caa0125f488cf4ddb5e3b16ba4734b199d7f45bef031f8dd9b8965ba1b77c5fab',
//           },
//           '0xfdcaa7b80642fe227679f60cb08705730a02016a635434b5cb7a0538481f0b8b',
//           '0x20f8c08080832625a094636f6c696e0000000000000000000000000000008405f5e1009423b03c27328fc8936331625f4c112a40f71d34f501b84501f842a0a7af570ade34f155a3817568a1268cc99aefde12cf5f75f2c556e3fcdac1d54ca0aa0125f488cf4ddb5e3b16ba4734b199d7f45bef031f8dd9b8965ba1b77c5fab26a007767b553446cd889224d74e56705df6525b2bdf626a1d429b4a5a5308636f2fa074740ef288456728752515da78f58bc46a2dc862dae26d2c095634a6e88d447c',
//         ],
//       ],
//       'should match with expected rawTransaction',
//       async ([txObject, privateKey, expected]) => {
//         const data = await caver.klay.accounts.signTransaction(txObject, privateKey)
//         expect(data.rawTransaction).to.be.equal(expected)
//       }
//     )
//   })
//
//   context('input:: accountKeyType: nil, humanReadable: false', () => {
//     it.each([
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0xce188683Bb0aB3B08e75Cc0e606BDC8B9ca3Ada4',
//             to:       '0x3442Cc6Df87b2d80aF2B6007c9703Bb559Fc2A2D',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             chainId: '0x1',
//           },
//           '0xeabf2c653cf42a02fe248f484a2f7d75fdcd2ed8cbdb675c32beeee88ac103b2',
//           '0x20f87c8080832625a0943442cc6df87b2d80af2b6007c9703bb559fc2a2d8405f5e10094ce188683bb0ab3b08e75cc0e606bdc8b9ca3ada4808280c025a0382c68424c693f786793706850cd30c562a234661223eea7ac038a4e9698fe05a049d9bb9344cddbbac84a1bd05166c20734a94f24b616ed164b749b1fa18aa969',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0xC5fcd393Afb90f7651Af994d83796D515a1606e5',
//             to:       '0x01927c16c4338e39dAa4d8C26029119cAe417c77',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             chainId: '0x1',
//           },
//           '0x21ebd79240c5551afb70e335db92ed3ce6c4f7d5e3b7ef853335799bd0acc8ff',
//           '0x20f87c8080832625a09401927c16c4338e39daa4d8c26029119cae417c778405f5e10094c5fcd393afb90f7651af994d83796d515a1606e5808280c026a0a82bf130620572a3f89414efcef2fd3a8580dafe366c09927697ee128d1c1437a073c9ed2190237030abb7b01f5edf65dbf5c0fd2c16ab3757520f61b9dfef6ddc',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0x08E08922eDF22Cb18A517Ef4d800b9ac8b509592',
//             to:       '0x1Da2559f34C089774e4b68689F849Ef36FBFbA10',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             chainId: '0x1',
//           },
//           '0x47f2c8754b8c1886ed92222df4cce6edf1571304ea1c516d8881bc782bc6baca',
//           '0x20f87c8080832625a0941da2559f34c089774e4b68689f849ef36fbfba108405f5e1009408e08922edf22cb18a517ef4d800b9ac8b509592808280c026a0bc45ba799672ed9bbb6f6bbe3f03fcb23acefce7f46a573b63dcfd29a02d4224a03dff7dfd517ce7015b68ae854018becd0b4409b6c1267164a6b5b95f96cc43a0',
//         ],
//       ],
//       'should match with expected rawTransaction',
//       async ([txObject, privateKey, expected]) => {
//         const data = await caver.klay.accounts.signTransaction(txObject, privateKey)
//         expect(data.rawTransaction).to.be.equal(expected)
//       }
//     )
//   })
//
//   context('input:: accountKeyType: nil, humanReadable: true', () => {
//     it.each([
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0xd9B4491085fA41e03f72085F644c721D8e7f9B46',
//             to:       '0x636F6C696e000000000000000000000000000000',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//           },
//           '0x16e4ee5c0231d5087679ae65bd9d956b281687e96945719fed0fef843f4f6432',
//           '0x20f87c8080832625a094636f6c696e0000000000000000000000000000008405f5e10094d9b4491085fa41e03f72085f644c721d8e7f9b46018280c026a0f6adbdbecccb6fe3b783f28bdcc6fb8199f1c468653e3f2d53aff7bb6d94021da03090907d8a5e3cc9839710f046faceb4ee781f2ca4c100368ae0abb8d6bc6460',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0xe88f947BFaB235e0E537845Db6ee1bC78f048317',
//             to:       '0x636F6C696e000000000000000000000000000000',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//           },
//           '0xfb64f6fba646d66bde0634e442c8f232509fde508d198f84c0a68bd298bfa429',
//           '0x20f87c8080832625a094636f6c696e0000000000000000000000000000008405f5e10094e88f947bfab235e0e537845db6ee1bc78f048317018280c025a047b8083e3057caa4774939fdae1d33bb32f381ce29db14b1aaed3b5b03d6fe20a076239953790e320538414feea98e1ec78b8e097b43e7a794d448f6c980ea5806',
//         ],
//         [
//           {
//             type: 'ACCOUNT_CREATION',
//             from:     '0xB2556bD919Dbe765F31504BE8058164dD6eC119B',
//             to:       '0x636F6C696e000000000000000000000000000000',
//             nonce:    '0x0',
//             gasPrice: '0x0',
//             gasLimit:  '0x2625a0',
//             value:    '0x5f5e100',
//             humanReadable: true,
//             chainId: '0x1',
//           },
//           '0x66ddad01cb4b27a399c10479cbf97f47b48ec953f84171e342b23d94ebc593ba',
//           '0x20f87c8080832625a094636f6c696e0000000000000000000000000000008405f5e10094b2556bd919dbe765f31504be8058164dd6ec119b018280c025a0cce35e0901c9fa07bdd7446679cfb6aae5f08c76037caae3a195bc8aeb5925c6a045983c55db95ff9238541b0f7eba19df873e870e1df444b48a6beeddbda83322',
//         ],
//       ],
//       'should match with expected rawTransaction',
//       async ([txObject, privateKey, expected]) => {
//         const data = await caver.klay.accounts.signTransaction(txObject, privateKey)
//         expect(data.rawTransaction).to.be.equal(expected)
//       }
//     )
//   })
// })
