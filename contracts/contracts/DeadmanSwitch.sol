// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeadmanSwitch is ERC721, Ownable {
    enum AccessLevel { Private, Public, Whitelist }

    struct NFTInfo {
        string[] storageLinks;
        AccessLevel access;
        address[] whitelist;
    }

    uint256 public tokenCounter = 1;
    uint256 public mintFee = 0.01 ether;
    uint256 public constant DEFAULT_TIMEOUT = 30 days; // Default timeout


    mapping(uint256 => NFTInfo) public nftInfos;
    mapping(uint256 => uint256) public lastCheckedIn;
    mapping(uint256 => uint256) public tokenTimeout;

    constructor() ERC721("DeadMansSwitch", "DMS") Ownable(msg.sender){}

    function mint() public payable {
        require(msg.value >= mintFee, "Not enough Ether provided.");


        _mint(msg.sender, tokenCounter);

        NFTInfo storage newInfo = nftInfos[tokenCounter];
        newInfo.access = AccessLevel.Private;
        
        newInfo.storageLinks = new string[](0);
        lastCheckedIn[tokenCounter] = block.timestamp;

        tokenCounter++;
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed");
    }

    function isPublic(uint256 _tokenId) public view returns (bool) {
        uint256 _tokenTimeOut = getTimeout(_tokenId);
        if (lastCheckedIn[_tokenId] + _tokenTimeOut < block.timestamp) {
            return true;
        } else if (nftInfos[_tokenId].access == AccessLevel.Public) {
            return true;
        } else {
            return false;
        }
    }

    function isWhitelisted(uint256 tokenId, address user) public view returns (bool) {
        address[] memory whitelist = nftInfos[tokenId].whitelist;
        for (uint i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == user) {
                return true;
            }
        }
        return false;
    }

    function getLinksArray(uint256 tokenId) external view returns (string[] memory) {
        require(tokenId <= tokenCounter, "NFT does not exist");

        // Retrieve links array of specified NFT
        NFTInfo storage nftInfo = nftInfos[tokenId];
        return nftInfo.storageLinks;
    }



    function setCustomTimeout(uint256 tokenId, uint256 timeoutInSeconds) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can set a custom timeout");
        tokenTimeout[tokenId] = timeoutInSeconds;
    }

    function getTimeout(uint256 tokenId) public view returns (uint256) {
        if(tokenTimeout[tokenId] == 0) {
            return DEFAULT_TIMEOUT;
        }
        return tokenTimeout[tokenId];
    }

    function pushLink(uint256 tokenId, string memory link) public {
        NFTInfo storage nftInfo = nftInfos[tokenId];
        require(tokenId <= tokenCounter, "NFT does not exist");
        require(msg.sender == ownerOf(tokenId), "Only the owner can add links");
        nftInfo.storageLinks.push(link);
    }

    function setAccess(uint256 tokenId, AccessLevel access) public {
        require(tokenId <= tokenCounter, "NFT does not exist");
        require(msg.sender == ownerOf(tokenId), "Only the owner can set access");
        nftInfos[tokenId].access = access;
    }

    function addToWhitelist(uint256 tokenId, address user) public {
        require(tokenId <= tokenCounter, "NFT does not exist");
        require(msg.sender == ownerOf(tokenId), "Only the owner can add to the whitelist");
        nftInfos[tokenId].whitelist.push(user);
    }

    function viewLinks(uint256 tokenId) public view returns (string[] memory) {
        require(tokenId <= tokenCounter, "NFT does not exist");
        require(balanceOf(msg.sender) > 0, "Must hold at least 1 NFT to view others links");

        if (nftInfos[tokenId].access == AccessLevel.Public || block.timestamp > lastCheckedIn[tokenId] + getTimeout(tokenId)) {
            return nftInfos[tokenId].storageLinks;
        } else if (nftInfos[tokenId].access == AccessLevel.Private) {
            require(msg.sender == ownerOf(tokenId), "Only the owner can view the links");
            return nftInfos[tokenId].storageLinks;
        } else if (nftInfos[tokenId].access == AccessLevel.Whitelist) {
            require(isWhitelisted(tokenId, msg.sender), "You are not whitelisted to view the links");
            return nftInfos[tokenId].storageLinks;
        }

        return new string[](0);
    }
}
