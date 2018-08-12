pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/// @title TreeToken
contract TreeToken is ERC721Token("Buidl-Forest", "BFS"), Ownable {

    // Struct with tree attributes
    struct Tree {
        uint8 age;
        bytes32 color;
        int latitude;
        int longitude;
        uint value;
    }

    // All the trees minted
    Tree[] public trees;


    mapping(uint => uint) public treePrices;
    uint[] public treesForSale;
    mapping(uint => uint) public indexes;

    function mint(uint8 _age, 
                  bytes32 _color, 
                  int _latitude,  
                  int _longitude,  
                  uint _price)
                  public 
                  onlyOwner {

        Tree memory s = Tree({
            age: _age,  
            color: _color,
            latitude: _latitude,
            longitude: _longitude,
            value: _price
        });

        uint treeId = trees.push(s) - 1;

        treePrices[treeId] = _price;

        treesForSale.push(treeId);
        indexes[treeId] = treesForSale.length - 1;

        // _mint is a function part of ERC721Token that generates the NFT
        // The contract will own the newly minted tokens
        _mint(address(this), treeId);

    }

    /// @notice Get number of trees for sale
    function treesForSaleN() public view returns(uint) {
        return treesForSale.length;
    }

    /// @notice Get number of trees for sale
    function treesN() public view returns(uint) {
        return trees.length;
    }

    /// @notice Buy tree
    /// @param _treeId TokenId
    function buyTree(uint _treeId) public payable {
        // You can only buy the trees owned by this contract
        require(ownerOf(_treeId) == address(this));

        // Value sent should be at least the tree price
        require(msg.value >= treePrices[_treeId]);

        // We approve the transfer directly to avoid creating two trx
        // then we send the token to the sender
        tokenApprovals[_treeId] = msg.sender;
        safeTransferFrom(address(this), msg.sender, _treeId);

        // Delete the token from the list of tokens for sale
        uint256 replacer = treesForSale[treesForSale.length - 1];
        uint256 pos = indexes[_treeId];
        treesForSale[pos] = replacer;
        indexes[replacer] = pos;
        treesForSale.length--;
        
        uint refund = msg.value - treePrices[_treeId];
        if (refund > 0)
            msg.sender.transfer(refund);
    }

    /// @notice Withdraw sales balance
    function withdrawBalance() public onlyOwner {
        owner.transfer(address(this).balance);
    }
    
    /// @notice Concatenate strings
    /// @param _a First string
    /// @param _b Second string
    /// @return _a+_b
    function strConcat(string _a, string _b) private returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ab = new string(_ba.length + _bb.length);
        bytes memory bab = bytes(ab);
        uint k = 0;

        for (uint i = 0; i < _ba.length; i++) 
            bab[k++] = _ba[i];

        for (i = 0; i < _bb.length; i++) 
            bab[k++] = _bb[i];

        return string(bab);
    }
}