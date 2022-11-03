# NextJS NFT Marketplace with TheGraph

<br/>
<p align="center">
<img src="./img/nft-marketplace.png" width="500" alt="Hardhat NextJS Marketplace">
</a>
</p>
<br/>

This is a repo showing how to make a frontend NFT Marketplace from scratch!

## 1. Git clone the contracts repo

In it's own terminal / command line, run: 

```
git clone https://github.com/jtysorin/hardhat-nft-marketplace-fcc
cd hardhat-nft-marketplace-fcc
yarn
```

## 2. Deploy to goerli 

After installing dependencies, deploy your contracts to goerli:

```
yarn hardhat deploy --network goerli
```

## 3. Deploy your subgraph

```
cd ..
git clone https://github.com/jtysorin/graph-nft-marketplace-fcc
cd graph-nft-marketplace-fcc
yarn
```

Follow the instructions of the [README](https://github.com/jtysorin/graph-nft-marketplace-fcc/blob/master/README.md) of that repo. 

Then, make a `.env` file and place your temporary query URL into it as `NEXT_PUBLIC_SUBGRAPH_URL`.


## 4. Start your UI

Make sure that:
- In your `networkMapping.json` you have an entry for `NftMarketplace` on the goerli network. 
- You have a `NEXT_PUBLIC_SUBGRAPH_URL` in your `.env` file. 

```
yarn dev
```
