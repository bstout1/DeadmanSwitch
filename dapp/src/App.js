import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import * as axios from 'axios'
import { Web3Storage } from 'web3.storage'
const web3storageApi = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEJBYUVGMTMzNDE4MkUxREM2NWE5ZEM3RmZiNWRiNjU4RjFCQzhEQTciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjI1MjA5ODI0MjYsIm5hbWUiOiJmaXJzdCJ9.ipQK0dH8leW1j7szpETB_6kFoDZkzP7z4SVyEuNTLt4'
const dsJSON = require('./DeadmanSwitch.json')
const dsAbi = dsJSON.abi
const contractAddress = '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A'

function App() {
  const [appName, setAppName] = useState('Deadman Switch');

  const uploadJSON = async(_json, filename) => {
    const token = web3storageApi
    const client = new Web3Storage({ token })

    const json = _json 
    const file = new File([json], filename, {
      type: 'application/json'
    })

    const cid = await client.put([file])
    console.log('CID: ', cid)

    return `https://dweb.link/ipfs/${cid}`
  }


  const go = async(tokenId, string) => {

    const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });

    await litNodeClient.connect();
    let authSig;
    authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'zksyncTestnet'
      });
    const accs = [
      {
        contractAddress: '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A',
        standardContractType: '',
        chain: 'zksyncTestnet',
        method: 'isPublic',
        functionAbi: {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "isPublic",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        parameters: [tokenId],
        returnValueTest: {
          // comparator: '>=',
          value: 'true',
        },
      },
    ];

    let res;
    let encryptedString;
    let symmetricKey;
    res = await LitJsSdk.encryptString(string);
    encryptedString = res.encryptedString;
    symmetricKey = res.symmetricKey;

    let base64EncryptedString;
    base64EncryptedString = await LitJsSdk.blobToBase64String(
        encryptedString
      );
    let encryptedSymmetricKey;
    encryptedSymmetricKey =
        await litNodeClient.saveEncryptionKey({
          evmContractConditions: accs,
          symmetricKey: symmetricKey,
          authSig: authSig,
          chain: 'zksyncTestnet',
        });

    const encryptedData = base64EncryptedString
    const accessControlConditions = accs 

    const jsonForUpload = JSON.stringify({
      encryptedData,
      encryptedSymmetricKey,
      accessControlConditions,
    })

    const uuid = Date.now()

    const linkUrl = uploadJSON(jsonForUpload, `${uuid}.json`)
    //now make call to contract




  }

  return (
    <div className="App">
      <header className="App-header">
       
        
       
          {appName}
        
      </header>
    </div>
  );
}

export default App;
