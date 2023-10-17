const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

async function fixture() {
  const [owner, user1, user2] = await ethers.getSigners();
  const deadman = await ethers.deployContract('DeadmanSwitch');
  return { owner, user1, user2, deadman };
}


describe("DeadmanSwitch", function () {
    

    describe("mint", () => {
        it("should mint a new token", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            
            // const deadmanSwitch = await DeadmanSwitchContract.deploy()
            // console.log('Ds: ' + JSON.stringify(deadmanSwitch))
            // await DeadmanSwitchContract.deployed()
            console.log('address: ' + DeadmanSwitchContract.address)
            const tx = await DeadmanSwitchContract.mint( {value: ethers.utils.parseEther("0.01")} )
            const tokenId = 1
            expect(await DeadmanSwitchContract.ownerOf(tokenId)).to.equal(owner.address)
        })

        it("should reject minting if not enough ether is sent", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            
            try {
                await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.005") })
                assert.fail("Minting succeeded without enough ether")
            } catch (err) {
                expect(err.message).to.contain("Not enough Ether provided.")
            }
        })
    })

    describe("setAccess", () => {
        it("should allow the owner to set access level", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.setAccess(tokenId, 1)
            const accessLevel = await DeadmanSwitchContract.nftInfos(tokenId)
            console.log('accessLevel: ' + accessLevel)
            expect(accessLevel.toString()).to.equal("1")
        })

        it("should reject non-owners from setting access level", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({  value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            try {
                await DeadmanSwitchContract.connect(user2).setAccess(tokenId, 1)
                assert.fail("Non-owner was able to set access level")
            } catch (err) {
                expect(err.message).to.contain("Only the owner can set access")
            }
        })
    })


    describe("pushLink", () => {
        it("should allow the owner to push a link", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(user1).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(user1).pushLink(tokenId, "https://example.com")
            const nftInfo = await DeadmanSwitchContract.getLinksArray(tokenId)
            console.log('nftInfo: ' + nftInfo)
            expect(nftInfo[0]).to.equal("https://example.com")
        })

        it("should reject non-owners from pushing a link", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(user1).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            try {
                await DeadmanSwitchContract.connect(user2).pushLink(tokenId, "https://example.com")
                assert.fail("Non-owner was able to push a link")
            } catch (err) {
                expect(err.message).to.contain("Only the owner can add links")
            }
        })
    })

    describe("addToWhitelist", () => {

        it("should allow the owner to add an address to the whitelist", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(user1).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(user1).addToWhitelist(tokenId, user2.address)
            const nftInfo = await DeadmanSwitchContract.nftInfos(tokenId)
            const isWhitelisted = await DeadmanSwitchContract.isWhitelisted(tokenId, user2.address)
            expect(isWhitelisted).to.equal(true)
        })

        it("should reject non-owners from adding to the whitelist", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(user1).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            try {
                await DeadmanSwitchContract.connect(user2).addToWhitelist(tokenId, user2.address)
                assert.fail("Non-owner was able to add to the whitelist")
            } catch (err) {
                expect(err.message).to.contain("Only the owner can add to the whitelist")
            }
        })
    })


    describe("setCustomTimeout", () => {
        it("should allow the owner to set a custom timeout", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(owner).setCustomTimeout(tokenId, 600)
            const timeout = await DeadmanSwitchContract.tokenTimeout(tokenId)
            expect(timeout.toString()).to.equal("600")
        })

        it("should reject non-owners from setting a custom timeout", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            try {
                await DeadmanSwitchContract.connect(user2).setCustomTimeout(tokenId, 600)
                assert.fail("Non-owner was able to set a custom timeout")
            } catch (err) {
                expect(err.message).to.contain("Only the owner can set a custom timeout")
            }
        })
    })

    describe("getTimeout", () => {
        it("should return the custom timeout if set", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(owner).setCustomTimeout(tokenId, 600)
            const timeout = await DeadmanSwitchContract.getTimeout(tokenId)
            expect(timeout.toString()).to.equal("600")
        })

        it("should return the default timeout if not set", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(owner).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            const timeout = await DeadmanSwitchContract.getTimeout(tokenId)
            expect(timeout.toString()).to.equal("2592000")  // 30 days in seconds
        })
    })


    describe("viewLinks", () => {
        it("should allow viewing links if conditions are met", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(user1).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(user1).pushLink(tokenId, "https://example.com")
            const links = await DeadmanSwitchContract.connect(user1).viewLinks(tokenId)
            expect(links[0]).to.equal("https://example.com")
        })

        it("should reject viewing links if conditions are not met", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.connect(owner).mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            try {
                await DeadmanSwitchContract.connect(user2).viewLinks(tokenId)
                assert.fail("Viewing links succeeded without authorization")
            } catch (err) {
                expect(err.message).to.contain("Must hold at least 1 NFT to view others links")
            }
        })
    })

    describe("isPublic", () => {
        it("should return true if the token has gone public", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            await DeadmanSwitchContract.connect(owner).setAccess(tokenId, 1)  // Set to Public
            const isPublic = await DeadmanSwitchContract.isPublic(tokenId)
            expect(isPublic).to.equal(true)
        })

        it("should return false if the token is still private", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const tokenId = "1"
            const isPublic = await DeadmanSwitchContract.isPublic(tokenId)
            expect(isPublic).to.equal(false)
        })
    })

    describe("withdraw", () => {
        it("should allow the owner to withdraw funds", async () => {
            [owner, user1, user2] = await ethers.getSigners()
            const DeadmanSwitchContract = await ethers.deployContract("DeadmanSwitch")
            await DeadmanSwitchContract.mint({ value: ethers.utils.parseEther("0.01") })
            const provider = owner.provider
            const initialBalance = await provider.getBalance(owner.address)
            await DeadmanSwitchContract.connect(owner).withdraw()
            const finalBalance = await provider.getBalance(owner.address)
            expect(Number(finalBalance)).to.be.greaterThan(Number(initialBalance))
        })

       
    })
})
