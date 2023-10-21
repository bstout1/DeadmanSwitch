import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { useWeb3ReactModal } from '@bitiumagency/web3-react-modal';

const dsJSON = require('./DeadmanSwitch.json')
const dsAbi = dsJSON.abi

const Mint = () => {
    const { connect } = useWeb3ReactModal()
    const { active, account, library } = useWeb3React()
    const [NFTContract, setNFTContract] = useState()

    useEffect(() => {
        if (library) {
            const abi = dsAbi
            const contractAddress = '0x516dD68E8D85a93A8eE91B0DFEFE21DaE2D1b15A'
            setNFTContract(new ethers.Contract(contractAddress, abi, library.getSigner()))
        }
    }, [library])


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