const oasisABI = require('./abi/oasis.json');
const oasisABIV2 = require('./abi/oasisv2.json');
const erc721ABI = require('./abi/erc721.json');
const {ethers, Contract} = require("ethers");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TelegramBot = require('node-telegram-bot-api');
const { channelId, sfwChannelId, token} = require('./settings');

const bot = new TelegramBot(token, {polling: true});

// Setup network
var provider = new ethers.providers.JsonRpcProvider('https://rpc.dogmoney.money/public/full', 2000);
var wallet = ethers.Wallet.createRandom();

const account = wallet.connect(provider);

// Load OASIS contract
// let oasisContract = new ethers.Contract('0x657061bf5D268F70eA3eB1BCBeb078234e5Df19d', oasisABI, account);
let oasisContractV2 = new ethers.Contract('0x3E79C89f479824Bc24b9eAD73EB8c55F322FE963', oasisABIV2, account);

// List of approved collections
let approvedNFTs = [
    '0xd38B22794B308a2e55808a13D1E6a80C4be94Fd5', // RealDogePunks
    '0x0aF878360B48b5f51F4e919f3cC1EC08B78627ad', // Doge Domain Service
    '0xbeaE0fd8cceCC76AfcC137d89f2B006e8c543C84', // Dogepunks
    '0xBafF37Aa3667AbB92D9d10c2B0A1D4128033c4dF', // DAYC
    '0xE46727bb5B84d574eCCa7e562A36c23525FcF8Dc', // Council of Frogs
    '0xa2E57fa488cf272c87b066e2a3E0672c0c58784d', // Nightmare Rats
    '0x8F49C3CdDc3D5571eE9Ac05dC42be0Bdd01f8E60', // DogeChain Shibes
];

let nswfNFTs = [

]

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

    // if(token === '0x1De097da3Fe906137ece38a0583dA427b99e566e') { // Rat collectibles
    //     return 'https://raw.githubusercontent.com/shadowkite/rat-collectibles/main/bot/' + id + '.png';
    // }

    if(token === '0xd38B22794B308a2e55808a13D1E6a80C4be94Fd5') { // Realdogepunks
        return 'https://oasisnft.cash/output/realdogepunks/images/' + id + '.png';
    }

    if(token === '0xbeaE0fd8cceCC76AfcC137d89f2B006e8c543C84') { // Dogepunks
        return 'https://oasisnft.cash/output/dogepunks/images/' + id + '.png';
    }

    if(token === '0xBafF37Aa3667AbB92D9d10c2B0A1D4128033c4dF') { // DAYC
        return 'https://oasisnft.cash/output/dayc/images/' + id + '.png';
    }

    if(token === '0x8F49C3CdDc3D5571eE9Ac05dC42be0Bdd01f8E60') { // Shibes
        return 'https://ipfs.io/ipfs/bafybeicbmh5xvvtn5ogg3zdfrot6a5sjoxzys2dtmhl4dlfrxs4xidmvhq/' + id + '.png';
    }

    // if(token === '0xFB2EAc4FcE1c021512758620af79271889F7E7dC') { // BigButts
    //     return 'https://ipfs.io/ipfs/bafybeihde3yj4vnylkqvl5i73zl6fzxfz5zrrwn5ui5eubr23ruollnj7u/' + id + '.gif';
    // }

    return nft.tokenURI(id).then(function(url) {
        return fetch(url).then(async function (response) {
            return response.json();
        }).then(function (data) {
            // if(token === '0x1Db8975dEfdfbA58979c26085031F0dC9DB24787') {
            //     let image = 'https://ipfs.io/ipfs/QmZLcc3VMxxYj71v2FiMFWhZVQmELvPtKG5XChPJwZXBGY/' + id + '.png';
            //     if(data.image.endsWith('mp4')) {
            //         image = 'https://ipfs.io/ipfs/QmZLcc3VMxxYj71v2FiMFWhZVQmELvPtKG5XChPJwZXBGY/' + id + '.mp4';
            //     }

            //     return image;
            // }

            return data.image;
        }).catch(function () {
            return null;
        });
    }).catch(function() {
        return null;
    });
}

let getTokenMetaDataName = async function(token, id) {
    var nft = new ethers.Contract(token, erc721ABI, account);
    return nft.tokenURI(id).then(function(_url) {
        let url = _url;

        if(token === '0xd38B22794B308a2e55808a13D1E6a80C4be94Fd5') { // RealDogePunks
            url = 'https://oasisnft.cash/output/realdogepunks/meta/' + id + '.json';
        }

        if(token === '0xbeaE0fd8cceCC76AfcC137d89f2B006e8c543C84') { // Dogepunks
            url = 'https://oasisnft.cash/output/dogepunks/meta/' + id + '.json';
        }

        if(token === '0xBafF37Aa3667AbB92D9d10c2B0A1D4128033c4dF') { // DAYC
            url = 'https://oasisnft.cash/output/dayc/meta/' + id + '.json';
        }
        return fetch(url).then(async function (response) {


            return response.json();
        }).then(function (data) {
            return data.name;
        }).catch(function () {
            return null;
        });
    }).catch(function() {
        return null;
    });
}

// Send TG messages
let sendTgMessage = async (token, id, message) => {
    let safeForWork = true;


    // Only approved collections
    if(!approvedNFTs.includes(token)) {
        return;
    }

    if(nswfNFTs.includes(token)) {
     safeForWork = false;
    }

    getPhotoForToken(token, id).then((photo) => {
        if(photo === null) {
            // No photo? Display OASIS logo instead
            photo = 'https://oasis.cash/assets/images/oasis_logo.svg';
        }

        console.log("PHOTO", photo);

        const nft = new ethers.Contract(token, erc721ABI, account);
        nft.name().then((tokenName) => {
            let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis-nft.dog/token/${token}/${id})\n\n${message}\n\n[View collection on OASIS](https://oasis-nft.dog/collection/${token})`;

            bot.sendPhoto(channelId, photo, {
                caption: formattedMessage,
                parse_mode: 'MarkdownV2'
            }).catch((e) => {
                getTokenMetaDataName(token, id).then((name)=> {
                    if(tokenName === 'nigger.doge') {
                        return;
                    }
                    let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis-nft.dog/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis-nft.dog/collection/${token})`;

                    if(token === '0x0aF878360B48b5f51F4e919f3cC1EC08B78627ad' ) { // DNS CASE
                        formattedMessage = `[${tokenName.replace('.', '\\.')}](https://oasis-nft.dog/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis-nft.dog/collection/${token})`;
                    }
                    bot.sendMessage(channelId, formattedMessage, {
                        parse_mode: 'MarkdownV2'
                    });
                })
            });

            // if(safeForWork) {
            //     bot.sendPhoto(sfwChannelId, photo, {
            //         caption: formattedMessage,
            //         parse_mode: 'MarkdownV2',
            //     }).catch((e) => {
            //         console.log('error', e);
            //         getTokenMetaDataName(token, id).then((name)=> {
            //             if(tokenName === 'nigger.bch') {
            //                 return;
            //             }
            //             console.log('>>>', tokenName, token, id, message)
            //             let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis-nft.dog/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis-nft.dog/collection/${token})`;

            //             if(token === '0x0aF878360B48b5f51F4e919f3cC1EC08B78627ad' ) { // LNS CASE
            //                 formattedMessage = `[${tokenName.replace('.', '\\.')}](https://oasis-nft.dog/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis-nft.dog/collection/${token})`;
            //             }

            //             bot.sendMessage(sfwChannelId, formattedMessage, {
            //                 parse_mode: 'MarkdownV2'
            //             });
            //         })

            //     });;
            // }
        });
    });
}

async function main() {
    // V2
    oasisContractV2.on('Bid', (token, id, hash, bidder, bidPrice) => {
        console.log('Bid', token, id, hash, bidder, bidPrice)
        sendTgMessage(
            token,
            id,
            '↗️ Received bid for ' + ethers.utils.formatEther(bidPrice.toString()).replace('.', '\\.') + ' WDOGE');
    });

    // event Claim(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address taker, uint256 price);
    oasisContractV2.on('Claim', (token, id, hash, seller, taker, price) => {
        console.log('Claim', token, id, hash, seller, taker, price)
        sendTgMessage(
            token,
            id,
            '✅ Sold for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' WDOGE');
    });

    // event MakeOrder(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller);
    oasisContractV2.on('MakeOrder', (token, id, hash, seller) => {
        console.log('MakeOrder', token, id, hash, seller);
        oasisContractV2.getCurrentPrice(hash).then((price) => {
            oasisContractV2.orderInfo(hash).then((orderInfo) => {
                sendTgMessage(
                    token,
                    id,
                    '🆕 Listed for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' WDOGE\n'
                    + 'Auction type: ' + translateOrderType(orderInfo.orderType)
                );
            });
        });
    });
}

main();