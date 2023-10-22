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

const ViewLinks = () => {
    const { connect } = useWeb3ReactModal()
    const { active, account, library } = useWeb3React()
    const [NFTContract, setNFTContract] = useState()
    const [dataToEncryptHash, setDataToEncryptHash] = useState("")
    const [cipher, setCipher] = useState("")
    const [links, setLinks] = useState([])
    const [decryptedData, setDecryptedData] = useState("")

    useEffect(() => {
        if (library) {
            const abi = dsAbi
            const contractAddress = '0x951B174Dec6C3794015A52067122e424C575de8F'
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

     const viewLink = async(tokenId, string) => {
        console.log('add link fired')

        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
          });

        await litNodeClient.connect();
        let authSig;
        authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'mantleTestnet'
          });
        const evmContractConditions = [
          {
            contractAddress: '0x951B174Dec6C3794015A52067122e424C575de8F',
            chain: 'mantleTestnet',
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
                chain: 'mantleTestnet',
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
    const decryptContent = async(ciphertext, dataToEncryptHash, tokenId) => {
        console.log('got to decrypt')
        const _tokenId_ = tokenId.toString()
         const evmContractConditions = [
          {
            contractAddress: '0x951B174Dec6C3794015A52067122e424C575de8F',
            chain: 'mantleTestnet',
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
            functionParams: [_tokenId_],
            returnValueTest: {
              key: "",
              comparator: "=",
              value: 'true',
            },
          },
        ];
        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
          });

        await litNodeClient.connect();
        let authSig;
        authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'mantleTestnet'
          });
        LitJsSdk.decryptToString({
            evmContractConditions,
            ciphertext: ciphertext,
            dataToEncryptHash: dataToEncryptHash,
            authSig,
            chain: 'mantleTestnet'
        },
        litNodeClient
        )
        .then(res => {
            console.log('decryptedData' + res)
            setDecryptedData(res)
        })
        .catch((error) => console.error(error))
    }


    const getLinks = async () => {
        const links = await NFTContract.viewLinks(1)
        setLinks(links)
        const link1 = links[0]
        await fetch(link1)
            .then(response => {
                if(!response.ok) {
                    throw new Error('Network response was not OK ' + response.statusText)
                }
                return response.json()
            })
            .then(data => {
                console.log('cipher: ' + data.ciphertext)
                setCipher(data.ciphertext)
                console.log('hash: ' + data.dataToEncryptHash)
                setDataToEncryptHash(data.dataToEncryptHash)
                alert(cipher)
            })
            .catch(error => console.error(error))
        
        console.log('cipher ' + cipher)
        await decryptContent(cipher, dataToEncryptHash, 1)
        alert(decryptedData)
    }

    const makePublic = async () => {
        await NFTContract.setAccess(1, 1)
        alert('Content now public')
    }

    const checkIn = async () => {
        await NFTContract.checkIn(1)
        alert('Checked in successfully')
    }


    return (
        <div className='container'>
            {active ?
                <>
                    <h1>View Links</h1>
                    
                    <button onClick={getLinks}>View Link</button>
                    
                </>
                :
                <>
                    <p>
                        Connect to view content.
                    </p>
                
                </>
            }
        </div>
    )
}

export default ViewLinks