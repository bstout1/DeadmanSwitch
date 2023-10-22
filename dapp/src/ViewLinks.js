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
    const [decryptedLinksArray, setDecryptedLinksArray] = useState([])
    const [decryptedData, setDecryptedData] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [showingLinks, setShowingLinks] = useState(false)

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
        try {
            const decryptData = await LitJsSdk.decryptToString({
                evmContractConditions,
                ciphertext: ciphertext,
                dataToEncryptHash: dataToEncryptHash,
                authSig,
                chain: 'mantleTestnet'
            },
            litNodeClient
            )
           
            console.log('decryptedData: ' + decryptData)
            setDecryptedData(decryptData)
            return decryptData
        } catch(error) {
            console.error(error)
            return null
        }
    }

    const isTokenAccessible = async(tokenId) => {
        const isItPublic = await NFTContract.isPublic(tokenId)
        const ownerOfToken = await NFTContract.ownerOf(tokenId)
        if(!isItPublic && ownerOfToken != account) {
            return false
        } else {
            return true
        }
    }

    const getLinks = async (tokenId) => {
        // const isItPublic = await isTokenAccessible(tokenId)
        // if(!isItPublic) {
        //     alert('Token content not public')
        //     return
        // }
        const links = await NFTContract.viewLinks(tokenId)
        console.log('links' + links)
        await setLinks(links)
        
        try {
            const decryptedArray = await Promise.all(
                links.map(async link => {
                    const response = await fetch(link)
                    if(!response.ok) {
                        throw new Error('Network response was not OK ' + response.statusText)
                    }
                    const data = await response.json()
                    console.log('cipher: ' + data.ciphertext)
                    console.log('hash: ' + data.dataToEncryptHash)
                    const decryptedText = await decryptContent(data.ciphertext, data.dataToEncryptHash, tokenId)
                    return { text: decryptedText}
                }))
            console.log('decrypted array: ' + JSON.stringify(decryptedArray))
            setDecryptedLinksArray(decryptedArray)
        } catch(error) {
            console.error(error)
        }
      
    }

    const makePublic = async () => {
        await NFTContract.setAccess(1, 1)
        alert('Content now public')
    }

    const checkIn = async () => {
        await NFTContract.checkIn(1)
        alert('Checked in successfully')
    }

    const handleViewSubmit = (event) => {
        event.preventDefault()
        getLinks(tokenId)
        setShowingLinks(true)
    }


    return (
        <div className='container'>
            {active ?
                <>
                    <h1>View Links</h1>
                    <form onSubmit={handleViewSubmit}>
                    <div>
                            <label>
                            Token ID: 
                            <input
                             type="number"
                             value={tokenId}
                             onChange={(e) => setTokenId(e.target.value)}
                             />
                            </label>
                    </div>
                    <button type="submit">Submit</button>
                    </form>
                    
                    {showingLinks && (
                        <div style={{ marginTop: '20px'}}>
                        {decryptedLinksArray.map((item, index) => (
                            <div
                             key={index}
                             style={{
                                padding: '20px',
                                border: '1px solid #fff',
                                borderRadius: '8px',
                                marginBottom: '10px'
                             }}
                             >
                             <p>{item.text}</p>
                            </div>
                        ))}
                        </div>
                        )}
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