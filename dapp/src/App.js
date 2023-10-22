import logo from './logo.svg'
import './App.css'
import { useState } from 'react';
import { useFilePicker } from 'use-file-picker'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
import * as axios from 'axios'
import { Web3Storage } from 'web3.storage'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { Web3ReactModal } from '@bitiumagency/web3-react-modal'
import Mint from './Mint'



const web3storageApi = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEJBYUVGMTMzNDE4MkUxREM2NWE5ZEM3RmZiNWRiNjU4RjFCQzhEQTciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjI1MjA5ODI0MjYsIm5hbWUiOiJmaXJzdCJ9.ipQK0dH8leW1j7szpETB_6kFoDZkzP7z4SVyEuNTLt4'
const dsJSON = require('./DeadmanSwitch.json')
const dsAbi = dsJSON.abi
const contractAddress = '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A'

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider)
}

function App() {
  const [appName, setAppName] = useState('Deadman Switch')
  


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


 


  return (
    <Web3ReactProvider 
      getLibrary={getLibrary}>
    <div className="App">
      <header className="App-header">
       
        
       
          {appName}
          <Mint />
         
        
      </header>
      <Web3ReactModal
          useWeb3React={
            useWeb3React
          }
          supportedChains={[{
            name: 'zksyncTestnet',
            chainId: 280,
            rpcUrl: 'https://testnet.era.zksync.dev',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }},
            {
            name: 'zksyncEra',
            chainId: 280,
            rpcUrl: 'https://testnet.era.zksync.dev',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }},
            {
            name: 'Mantle',
            chainId: 5000,
            rpcUrl: 'https://rpc.mantle.xyz',
            nativeCurrency: {
              name: 'MNT',
              symbol: 'MNT',
              decimals: 18
            }},
            {
            name: 'MantleTestnet',
            chainId: 5001,
            rpcUrl: 'https://testnet.era.zksync.dev',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }
          }]}
          connectors={[{
            title: 'Metamask',
            id: 'metamask',
            connector: InjectedConnector,
          }]}
      />
    </div>
  </Web3ReactProvider>
  );
}

export default App;
