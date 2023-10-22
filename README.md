# DeadmanSwitch

This project is for the the EthOnline 2023 Hackathon. The concept is simple: anyone can create content that they can set as private, public or whitelisted, with the privacy ensured through encryption. The creator of the content needs to check-in within intervals that they set or the content will switch to public. There could be many reasons to use this kind of system, e.g. journalists or others who would want content to become public should they become unable to check-in. 

Front-end: App for posting encrypted content to decentralized storage and inserting the created URIs into smart contract. Also for reading content if it's public. See https://deadmanapp.com 

Smart Contract: Wallets can create threads of content as sets of URIs (like NFT token uris) and set their status (public, private, whitelisted). Anyone can query these URIs if they have access (either whitelisted or content has become public). If the creator continues to check-in on private content (i.e. shows signs of life) then it remains private, otherwise it becomes public (i.e. Lit protocol encryption becomes available to all). 

Technologies Used: 

* Lit Protocol v3 JS SDK: for encrypting and decrypting content based on the results of a function in a smart contract (the isPublic(tokenId) function)
* Filecoin: Encrypted content is stored on web3.storage and links are formed using dweb.link before being stored in the smart contract in relation to an NFT (the pushLink(tokenId, link) function)
* Solidity + Hardhat: for Smart Contracts
* Mantle: Contract is deployed and verified on Mantle Testnet: https://explorer.testnet.mantle.xyz/address/0x951B174Dec6C3794015A52067122e424C575de8F/contracts#address-tabs and Mainnet: https://explorer.mantle.xyz/address/0xc26DCd478D8Df5293035efC70bAe87f24b04b83B/contracts#address-tabs. 
* React: For the DApp. 

Demo Video: https://youtu.be/73AiZYae3jM
