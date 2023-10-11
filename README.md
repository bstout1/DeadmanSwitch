# DeadmanSwitch

This project is for the the EthOnline 2023 Hackathon. The concept is simple: anyone can create content that they can set as private, public or whitelisted, with the privacy ensured through encryption. The creator of the content needs to check-in within intervals that they set or the content will switch to public. There could be many reasons to use this kind of system, e.g. journalists or others who would want content to become public should they become unable to check-in. 

Front-end: App for posting encrypted content to decentralized storage and inserting the created URIs into smart contract. Also for reading content if it's public. 

Smart Contract: Wallets can create threads of content as sets of URIs (like NFT token uris) and set their status (public, private, whitelisted). Anyone can query these URIs if they have access (either whitelisted or content has become public). If the creator continues to check-in on private content (i.e. shows signs of life) then it remains private, otherwise it becomes public (i.e. Lit protocol encryption becomes available to all). 
