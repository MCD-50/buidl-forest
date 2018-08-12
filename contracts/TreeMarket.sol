pragma solidity 0.4.24;

import "./TreeToken.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";


/// @title Escrow contract
contract TreeMarket is ERC721Holder {

    struct Sale {
        uint treeId;
        uint price;
        address owner;
    }

    TreeToken public token;

    Sale[] public sales;

    mapping(uint => uint) public treeToSale;

    event NewSale(uint indexed treeId, uint price, uint saleId);

    event ShipSold(uint indexed treeId, uint price, address indexed oldOwner, address indexed newOwner);

    /// @notice Constructor
    /// @param _token tree token address
    constructor(address _token) public {
        token = TreeToken(_token);
    }

    /// @notice Buy token
    /// @param _saleId Index of sales[]
    function buy(uint _saleId) public payable {
        Sale storage s = sales[_saleId];

        // TODO: uncomment this to avoid the owner buying his own tokens
        require(s.owner != msg.sender);
        require(msg.value >= s.price);
        
        uint refund = msg.value - s.price;
        if(refund > 0)
            msg.sender.transfer(refund);

        s.owner.transfer(s.price);

        emit ShipSold(s.treeId, s.price, s.owner, msg.sender);

        // Transfer the token
        token.approve(msg.sender, s.treeId);
        token.safeTransferFrom(address(this), msg.sender, s.treeId);

        // Delete sale
        delete treeToSale[s.treeId];
        Sale replacer = sales[sales.length - 1];
        sales[_saleId] = replacer;
        sales.length--;
    }

    /// @notice Set token for sale
    /// @param _treeId Token Id
    /// @param _price Sale price
    function forSale(uint _treeId, uint _price) public {
        // You can only sell your own tree
        require(token.ownerOf(_treeId) == msg.sender);

        token.safeTransferFrom(msg.sender, address(this), _treeId);

        Sale memory s = Sale({
            treeId: _treeId,
            price: _price,
            owner: msg.sender
        });

        uint saleId = sales.push(s) - 1;
        treeToSale[_treeId] = saleId;

        emit NewSale(_treeId, _price, saleId);
    }

    /// @notice Remove listing
    /// @param _treeId tree Id
    function withdraw(uint _treeId) {
        require(sales[treeToSale[_treeId]].owner == msg.sender);

        delete sales[treeToSale[_treeId]];
        delete treeToSale[_treeId];

        token.safeTransferFrom(address(this), msg.sender, _treeId);
    }

    /// @notice Ships for sale quantity
    function nSale() public view returns(uint) {
        return sales.length;
    }
}
