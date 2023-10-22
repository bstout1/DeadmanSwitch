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
    const [nftBalance, setNFTBalance] = useState("")
    const [addingLink, setAddingLink] = useState(false)
    const [tokenId, setTokenId] = useState("")
    const [newText, setNewText] = useState("")

    const getBalance = async () => {
            try {
                const nftBalance = await NFTContract.balanceOf(account)
                console.log('nft balance: ' + nftBalance)
                setNFTBalance(nftBalance.toString())
            } catch(error) {
                console.error('Error fetching NFT Balance: ' + error)
            }
    }
            

    useEffect(() => {
        if (library) {
            const abi = dsAbi
            const zkscontractAddress = '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A'
            const contractAddress = '0x951B174Dec6C3794015A52067122e424C575de8F'
            setNFTContract(new ethers.Contract(contractAddress, abi, library.getSigner()))
            if(NFTContract) {
                getBalance().then(console.log)
            }
        
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


    const mintNFT = async () => {
        await NFTContract.mint({
            value: ethers.utils.parseEther('20'),
        })
        alert('Successfully minted')
    }

    const makePublic = async () => {
        await NFTContract.setAccess(1, 1)
        alert('Content now public')
    }

    const checkIn = async () => {
        await NFTContract.checkIn(1)
        alert('Checked in successfully')
    }

    const addLinkForm = () => {
        setAddingLink(true)
    }

    const handleLinkSubmit = (event) => {
        event.preventDefault()
        addLink(tokenId, newText)
    }


    return (
        <div className='container'>
            {active ?
                <>
                    <h1>Mint & Manage NFT</h1>
                    <p>Your account: {account}</p>
                    <p>{nftBalance === 0 ? 'Please Mint Your NFT' : `Your NFT balance: ${nftBalance}` }</p>
                    <button onClick={mintNFT}>Mint NFT</button>
                    <button onClick={addLinkForm}>Add Link</button>
                    <button onClick={checkIn}>Check In</button>
                    <button onClick={makePublic}>Make Public</button>
                    {addingLink && (
                    <form onSubmit={handleLinkSubmit}>
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
                        <div>
                            <label>
                            Text: 
                            <textarea
                             value={newText}
                             onChange={(e) => setNewText(e.target.value)}
                             ></textarea>
                        </label>
                        <button type="submit">Submit</button>
                        </div>
                    </form>


                  )}
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