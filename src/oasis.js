const oasisABI = require('./abi/oasis.json');
const erc721ABI = require('./abi/erc721.json');
const {ethers} = require("ethers");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TelegramBot = require('node-telegram-bot-api');
const { channelId, token} = require('./settings');

const bot = new TelegramBot(token, {polling: true});

// Setup network
var provider = new ethers.providers.JsonRpcProvider('https://smartbch.fountainhead.cash/mainnet', 10000);
var wallet = ethers.Wallet.createRandom();

const account = wallet.connect(provider);

// Load OASIS contract
let oasisContract = new ethers.Contract('0x657061bf5D268F70eA3eB1BCBeb078234e5Df19d', oasisABI, account);

// List of approved collections
let approvedNFTs = [
    '0xE765026Cad648785b080E78700cBF6fa1C050d7C', // CashCats
    '0xD27CFd5b254E8D958c0c8e7f99E17A1e33652C1A', // CryptoR.AT
    '0x88fA0495d5E9C1B178EAc1D76DF9D729e39fD8E8', // Poolside Puffers
    '0x142d360e65d664B3074d03A1AC3fCDECFeCBC5F9', // TROPICAL.GULLS
    '0xe017AC8A93790571AF6a93f34cE2258dC900006B', // TROPICAL.MONSTER
    '0xa48C513189F8971736A1e4f3E786f471bf1EBfE1', // DAIQUI.DUDES
    '0xff48aAbDDACdc8A6263A2eBC6C1A68d8c46b1bf7', // LawPunks
    '0x9F6466C0ffe9245d994C18c8B0575Af22a5AeEd5', // Cattos
    '0xf913c55C9E3642dbaA62c26Ff010e97565DeD3B1', // Fatcat
    '0x8FdC63Fe8496D819731e1d447B1eB35951798AA3', // DAOer
    '0x23d9B4b351d5C57f38206dB0697B891d2A32732E', // Potato
    '0xdccB0e678bEA8FE3d97921CbFF85Be757a223312', // BWB series
    '0x147f7D752ed7375E4e7B50aC2C94723F171cE90d', // RealMoutai
];

// Order type # to name
let translateOrderType = function(type) {
    var translatedOrderType = 'Unknown';
    switch(type) {
        case 0: translatedOrderType = 'Fixed price'; break;
        case 1: translatedOrderType = 'Dutch auction'; break;
        case 2: translatedOrderType = 'English auction'; break;
    }
    return translatedOrderType;
}

// Get image, when it fails always return null
let getPhotoForToken = async function(token, id) {
    var nft = new ethers.Contract(token, erc721ABI, account);
    return nft.tokenURI(id).then(function(url) {
        return fetch(url).then(async function (response) {
            return response.json();
        }).then(function (data) {
            return data.image;
        }).catch(function () {
            return null;
        });
    }).catch(function() {
        return null;
    });
}

// Send TG messages
let sendTgMessage = async (token, id, message) => {
    // Only approved collections
    if(!approvedNFTs.includes(token)) {
        return;
    }

    getPhotoForToken(token, id).then((photo) => {
        if(photo === null) {
            // No photo? Display OASIS logo instead
            photo = 'https://oasis.cash/assets/images/oasis_logo.svg';
        }

        const nft = new ethers.Contract(token, erc721ABI, account);
        nft.name().then((tokenName) => {
            let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis.cash/token/${token}/${id}) \n\n ${message} \n\n [View collection](https://oasis.cash/collection/${token})`;

            bot.sendPhoto(channelId, photo, {
                caption: formattedMessage,
                parse_mode: 'MarkdownV2'
            });
        });
    });
}

async function main() {
    // event Bid(IERC721 indexed token, uint256 id, bytes32 indexed hash, address bidder, uint256 bidPrice);
    oasisContract.on('Bid', (token, id, hash, bidder, bidPrice) => {
        console.log('Bid', token, id, hash, bidder, bidPrice)
        sendTgMessage(
            token,
            id,
            '↗️ Received bid for ' + ethers.utils.formatEther(bidPrice.toString()).replace('.', '\\.') + ' BCH');
    });

    // event Claim(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address taker, uint256 price);
    oasisContract.on('Claim', (token, id, hash, seller, taker, price) => {
        console.log('Claim', token, id, hash, seller, taker, price)
        sendTgMessage(
            token,
            id,
            '✅ Sold for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' BCH');
    });

    // event MakeOrder(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller);
    oasisContract.on('MakeOrder', (token, id, hash, seller) => {
        console.log('MakeOrder', token, id, hash, seller);
        oasisContract.getCurrentPrice(hash).then((price) => {
            oasisContract.orderInfo(hash).then((orderInfo) => {
                sendTgMessage(
                    token,
                    id,
                    '✳️ Listed for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' BCH\n'
                    + 'Auction type: ' + translateOrderType(orderInfo.orderType)
                );
            });
        });
    });
}

main();