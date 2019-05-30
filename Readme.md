Poc(Klaytn dapp hackathon)
===

### 1. Project Summary

author: Team MBGA

Deployed Page connecting with Klaytn Baobab testnet: [poc](https://poc.mbga.dev)

Deployed Contract Address: 0xb0980a73aca067c1dd8d0cc6f82ae2d27e2f866e

Video Example : [link]()

src folder: HTML page by React Component(using mobx)

contracts folder: Smart Contract(only using DodoRepository.sol)

### 2. What is Trying to be Solved Through Blockchain?

I want to help people make habits. Easily, this bapp is a decentralized version of the existing https://gofuckingdoit.com. I want to make an app that can expect rewards and guarantee transparency. The previous model pays money in the event of failure and, get money back in the case of success. There is no additional reward. Another problem is that existing apps have centralized operators, which can lead to failure for the benefit of the operator. We will solve this probliem by decentralized oracle.

### 3. Main Features of the Service

Create Challenge, submit the proof of the challenge, judge the proof of the challenge, finalize the challenge and get Reward

### 4. How to use Smart contract

![user <-> smart contract interaction](https://user-images.githubusercontent.com/7679722/58646469-5fce1e00-8340-11e9-9435-2fb69d273a9d.png)

Excepting store large data like photo or video, all user data will be stored on Smart Contract.

### 5-1. Explain the business model (if existent). 

In the future, I would like to express the act of making a habit by Challenge.
If someone wants to start a Challenge for our app, deposit a certain amount of Klaytn and proceed with the project.

When the project is successful, the money is returned and a bonus is given proportional to the deposited amount.

If project fails, klaytn will not send to challenger. 15 percent of the returned money will be used for the project judges (3), another n percent for the operator, (100-15-n) percent for the monthly settlement.

This (100-15-n) percent will distribute the bonus holders who settle the token rewards to those who have succeeded in the project, and the tokens rewards given by the judges of the project judges appropriately.


I do not expect the Klayton token price, so I will try to calculate it with fiat money. Personally, at least one in five people think the project will fail. When I saw the app called Challenges, there were many people who put about 50,000 won in about two weeks. Assuming 100,000 won per month and assuming about 10,000 people a month (please!), 1 billion * ⅕ * n / 100 = 2 million won * n is considered to be the expected profit. I personally think that n is up to 20, and there are many people who participate, or a way to reduce n as the service gets established.

In short, our profits are the fees of the losers.

### 5-2. What is the expected outcome?

From a technical point of view, we expect to be able to help provide decentralized Oracle services.
In general, our goal is to make it easier for people to access blockchain. Our Bapp is a topic that is not subject to public objection, and it will be helpful for future influx of Klaytn main net.

### 6. Further Idea

NFT Token for special challenge or special community member.

### 7. build & run

run in local environment

```
npm run local
```

build in real server

```
npm run build:real
```

deploy

```
firebase deploy
```
