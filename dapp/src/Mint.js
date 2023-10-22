import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { useWeb3ReactModal } from '@bitiumagency/web3-react-modal'
import { Web3Storage } from 'web3.storage'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
const web3storageApi = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEJBYUVGMTMzNDE4MkUxREM2NWE5ZEM3RmZiNWRiNjU4RjFCQzhEQTciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjI1MjA5ODI0MjYsIm5hbWUiOiJmaXJzdCJ9.ipQK0dH8leW1j7szpETB_6kFoDZkzP7z4SVyEuNTLt4'


const dsJSON = require('./DeadmanSwitch.json')
const dsAbi = dsJSON.abi

const DummyString = ['Super secret string']

const Mint = () => {
    const { connect } = useWeb3ReactModal()
    const { active, account, library } = useWeb3React()
    const [NFTContract, setNFTContract] = useState()
    const [dataToEncryptHash, setDataToEncryptHash] = useState("")
    const [ciphertext, setCipherText] = useState("")

    useEffect(() => {
        if (library) {
            const abi = dsAbi
            const contractAddress = '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A'
            setNFTContract(new ethers.Contract(contractAddress, abi, library.getSigner()))
        }
    }, [library])

    const uploadJSON = async(_json, filename) => {
        const token = web3storageApi
        const client = new Web3Storage({ token })

        const json = _json 
        const file = new File([json], filename, {
          type: 'application/json'
        })

        const cid = await client.put([file])
        console.log('CID: ', cid)

        return `https://dweb.link/ipfs/${cid}/${filename}`
      }

     const addLink = async(tokenId, string) => {
        console.log('add link fired')

        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
          });

        await litNodeClient.connect();
        let authSig;
        authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'zksyncTestnet'
          });
        const evmContractConditions = [
          {
            contractAddress: '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A',
            chain: 'zksyncTestnet',
            functionName: 'isPublic',
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
            functionParams: [tokenId],
            returnValueTest: {
              key: "",
              comparator: "=",
              value: 'true',
            },
          },
        ];
        

        let res;
        let encryptedString;
        let symmetricKey;
        // res = await LitJsSdk.encryptString(string)   old way

        res = await LitJsSdk.encryptString(
            {
                evmContractConditions: evmContractConditions,
                authSig,
                chain: 'zksyncTestnet',
                dataToEncrypt: string
            },
            litNodeClient
            )    
        
        
        console.log('res' + JSON.stringify(res))

        // { Loading... } 
        const ciphertext = res.ciphertext;

        // { Loading... } 
        const dataToEncryptHash = res.dataToEncryptHash;

      

        const jsonForUpload = JSON.stringify({
          dataToEncryptHash,
          ciphertext,
          evmContractConditions,
        })

        const uuid = Date.now()

        const linkUrl = uploadJSON(jsonForUpload, `${uuid}.json`)
        //now make call to contract

        await NFTContract.pushLink(tokenId, linkUrl)
        alert('link submitted successfully')

  }


    const mintNFT = async () => {
        await NFTContract.mint({
            value: ethers.utils.parseEther('0.01'),
        })
        alert('Successfully minted')
    }


    return (
        <div className='container'>
            {active ?
                <>
                    <h1>Mint NFT</h1>
                    <p>Your account: {account}</p>
                    <button onClick={mintNFT}>Mint NFT</button>
                    <button onClick={() => addLink('1', 'super secret string')}>Add Link</button>
                </>
                :
                <>
                    <p>
                        Connect and mint an NFT to gain access to the system.
                    </p>
                    <button onClick={connect}>Connect wallet</button>
                </>
            }
        </div>
    )
}

export default Mint