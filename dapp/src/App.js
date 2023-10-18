import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import * as axios from 'axios'
import { Web3Storage } from 'web3.storage'
const web3storageApi = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEJBYUVGMTMzNDE4MkUxREM2NWE5ZEM3RmZiNWRiNjU4RjFCQzhEQTciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjI1MjA5ODI0MjYsIm5hbWUiOiJmaXJzdCJ9.ipQK0dH8leW1j7szpETB_6kFoDZkzP7z4SVyEuNTLt4'
const dsJSON = require('./DeadmanSwitch.json')
const dsAbi = dsJSON.abi

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
        contractAddress: '0xDEdD2B43d9e116F726aD9b842648eFE3B2EE196f',
        standardContractType: '',
        chain: 'zksyncTestnet',
        method: 'isPublic',
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
          accessControlConditions: accs,
          symmetricKey: symmetricKey,
          authSig: authSig,
          chain: 'zksync',
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
