const oasisABI = require('./abi/oasis.json');
const oasisABIV2 = require('./abi/oasisv2.json');
const erc721ABI = require('./abi/erc721.json');
const {ethers, Contract} = require("ethers");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TelegramBot = require('node-telegram-bot-api');
const { channelId, sfwChannelId, token} = require('./settings');

const bot = new TelegramBot(token, {polling: true});

// Setup network
var provider = new ethers.providers.JsonRpcProvider('https://smartbch.fountainhead.cash/mainnet', 10000);
var wallet = ethers.Wallet.createRandom();

const account = wallet.connect(provider);

// Load OASIS contract
let oasisContract = new ethers.Contract('0x657061bf5D268F70eA3eB1BCBeb078234e5Df19d', oasisABI, account);
let oasisContractV2 = new ethers.Contract('0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7', oasisABIV2, account);

// List of approved collections
let approvedNFTs = [
    '0xE765026Cad648785b080E78700cBF6fa1C050d7C', // CashCats
    '0x91bc4F61d45Dfbb9C277CDF6928923Cb46e8A2E9', // CryptoR.AT
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
    '0x36F7e5eaFA2E96872B40cFBeD8e41767337ca8cF', // Queens
    '0x62587576142bd5b73F71d6DA51389Fb6b92216AE', // FORGOTTEN LADS
    '0x906f654CF46a564D1C8c70601757b4973A9c30E9', // PRESENT LADS
    '0x65496F09592883390Df9780964CE04F2e2C07b93', // SPICE NFT
    '0x48973dbAC0d46B939CD12A7250eFBA965e8a8cf2', // REAPERS
    '0xacFe3CeFac34845952EaECD1a184b8c0BD70A0FD',  //LAMBO
    '0x669765aE975d4BeA5C557E2639968D91b9f85056',  // BUGS
    '0x4c9Dc38d032758cf5C81211cba53A90d27d08442',  // PANDA
    '0x6b744a257F5147b8c5C539c1AeDDea14f4F2D13E',  // SAMURAI
    '0x3Ff238D20acE45653AA1c91DEc5ee40bd53240f4',  // CATHEDRAL
    '0x8868da0a8CF8E28e683366368f6912A2005b1Cf5',  // WOJAK
    '0xe0DBb71DC5BB9dfF69e7c7ff882926E56070cAF9',  // BCHDAO
    '0xC054A7F7866ba73889511c48967be776008eb408',  // APES,
    '0x87e2aF80e1DB921ddB70e8F6DE19398AbD7060b9',  // BCH & SBCH Influencers
    '0xbec69e04e99e21210213405E0fe99b95c040BD74', // JOYBOTS
    '0x5C1B3f5486cf342e491Ce316e98281822b800979', // Arachnids
    '0x0C3A8C1ef42A0A0a0AEDc6D89c96Ec51bedE41B6', // Modern Fairy
    '0x44482A93b34138Ad156f158F67dd1F6bfa483619', // Pixs RPG
    '0x87aA4eF35454fEF0B3E796d20Ab609d3c941F46b', // WAIFU
    '0xD5fBf904f8867391Fbee5FCd29fF859fA32Fc399', // COSMOS
    '0xbcD746d3e1753523182C26f5004d4673Fbe36677', // WOLFZ
    '0xC995199DC53922caCE4f6ac14A476eF8c9429387', // Pixel Guys Club
    '0x9EE8EA9E772f82b94Ee455CEf50D40f77e9E12C1', // Anonymous NFT
    '0xC57C7A1C9864A1D00F11731c6FA6a5dC16EDFb7F', // META ARMY
    '0x43e93a9369Cc588a34F9f6ED97DD4b523e003331', // Annlogy X FRN: 8-bit Zodiac
    '0xadA2b62f75C9d619c4Bb68A03C7541f6cE5cc127', // Schoolgirls
    '0xf928B82061bc531e3B24B8CF3736724e35988b7a', //Shorai NFTs
    '0x271c2fFf28dFFa8aBe423293326Fc2D57844a4cd', // Korro
    '0xcEBcD3b339eE0ed9fcb0465eBeac3994A7CF2a7a', // Pixelitos
    '0x2cb256a216EB5c74Bf43A3Ff32b8Cd5bB55692Fe', // space bot
    '0x1A0839E51837Db26589EFbe401947d1C7aAc28E2', // sphynx
    '0x32650517D7D4c54935197ff5F3e575D5fb210A63', // LNS
    '0x9c907c7CC0B671E51667bb4178419043c5b94d9c', // BCH Wizzard
    '0xad2f872AF013C7275eEBC6e7a43d604bA186db6D', // FunkyBots
    '0x4f0A64a905EEeB70810a079019Fd23586eca5268', // World of Masks
    '0x0b12b767440e3f0CdC374304e1741329ab3683C3', // Picololi
    '0x3aABc773Cb699AD2F70dfc6F46316c7aB12e35e9', // Lucky Tigers
    '0xe24Ed1C92feab3Bb87cE7c97Df030f83E28d9667', // LAW Rights
    '0x1De097da3Fe906137ece38a0583dA427b99e566e', // Rats specials
    '0xFD325598bbB5672f8136A5b35885722a3d440aE0', // Kensho
    '0xc6f9DbbE871ed2f79E3fF584f8Aa30E29B35bA61', // Moodies
    '0x76A9a7866Ec82fC616Bd5024Fb627335538C8757', // Rebels
    '0x01c2B0359bde2bE676d8aA9470DE921DC3b4EAF9', // Stolen Art
    '0x58437B3A91db2F9e477F4b329c812Dff25F03357', // LawPunk Items
    '0x47C388a14712434B14b2a111ce4042B537D69d4a', // Kensho exclusives
    '0xb040AfF405D749dB94fEe8F60C721380e19E0c01', // SmartBabies
    '0xcAd88cBE12bf9A0eAa0f80091dbFbdC0257Abe68', // Cash Bears
    '0xc6f9DbbE871ed2f79E3fF584f8Aa30E29B35bA61', // Moodies
    '0xD710EF1E6aDfb5f81B3598f9Eea70512c5B100F5', // Council of frogs
    '0xFDEd6cD4B88a24e00d9Ea242338367fe734CBff5', // PokeBen
    '0xF9c0787670908c8c363E2205608bc5f4a6f95e09', // PunkApes
    '0xFB2EAc4FcE1c021512758620af79271889F7E7dC', // BigButts
    '0x5aC48D7AC0dc02eB8e186bf1603a27F32F76D5fC', // Xolos
    '0xbad64f85727D27e67631BC1a5B6e339cd1830c4a0', // Cackles
    '0x1Db8975dEfdfbA58979c26085031F0dC9DB24787', // reapers first drop
    '0xb1C2103F29341C0E62aE88a5d13D84b5ea6757A9', // Reaperville
    '0x1f0dD278D62868fa58016060a1548973F8AFEd55', // Goblin Town,
    '0x2E9173F46ea4733538a86025C6bE39fCbd71Eeb6' // I'm tired
];

let nswfNFTs = [
    '0x8868da0a8CF8E28e683366368f6912A2005b1Cf5',   // WOJAK
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

    if(token === '0x1De097da3Fe906137ece38a0583dA427b99e566e') { // Rat collectibles
        return 'https://raw.githubusercontent.com/shadowkite/rat-collectibles/main/bot/' + id + '.png';
    }

    if(token === '0xc6f9DbbE871ed2f79E3fF584f8Aa30E29B35bA61') { // Moodies
        return 'https://ipfs.io/ipfs/Qmas8SGoBzBi4J888SUjoPf7xkh4yGmCzdnrYWoC9B2p8S/' + id + '.png';
    }

    if(token === '0xFB2EAc4FcE1c021512758620af79271889F7E7dC') { // BigButts
        return 'https://ipfs.io/ipfs/bafybeihde3yj4vnylkqvl5i73zl6fzxfz5zrrwn5ui5eubr23ruollnj7u/' + id + '.gif';
    }

    return nft.tokenURI(id).then(function(url) {
        return fetch(url).then(async function (response) {
            return response.json();
        }).then(function (data) {
            if(token === '0x1Db8975dEfdfbA58979c26085031F0dC9DB24787') {
                let image = 'https://ipfs.io/ipfs/QmZLcc3VMxxYj71v2FiMFWhZVQmELvPtKG5XChPJwZXBGY/' + id + '.png';
                if(data.image.endsWith('mp4')) {
                    image = 'https://ipfs.io/ipfs/QmZLcc3VMxxYj71v2FiMFWhZVQmELvPtKG5XChPJwZXBGY/' + id + '.mp4';
                }

                console.log('REAPER SUMMON', image)
                return image;
            }

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
    return nft.tokenURI(id).then(function(url) {
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
            let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis.cash/token/${token}/${id})\n\n${message}\n\n[View collection on OASIS](https://oasis.cash/collection/${token})`;

            bot.sendPhoto(channelId, photo, {
                caption: formattedMessage,
                parse_mode: 'MarkdownV2'
            }).catch((e) => {
                getTokenMetaDataName(token, id).then((name)=> {
                    if(tokenName === 'nigger.bch') {
                        return;
                    }
                    let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis.cash/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis.cash/collection/${token})`;

                    if(token === '0x32650517D7D4c54935197ff5F3e575D5fb210A63' ) { // LNS CASE
                        formattedMessage = `[${tokenName.replace('.', '\\.')}](https://oasis.cash/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis.cash/collection/${token})`;
                    }
                    bot.sendMessage(channelId, formattedMessage, {
                        parse_mode: 'MarkdownV2'
                    });
                })
            });

            if(safeForWork) {
                bot.sendPhoto(sfwChannelId, photo, {
                    caption: formattedMessage,
                    parse_mode: 'MarkdownV2',
                }).catch((e) => {
                    getTokenMetaDataName(token, id).then((name)=> {
                        if(tokenName === 'nigger.bch') {
                            return;
                        }
                        let formattedMessage = `[${tokenName.replace('.', '\\.')} \\#${id}](https://oasis.cash/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis.cash/collection/${token})`;

                        if(token === '0x32650517D7D4c54935197ff5F3e575D5fb210A63' ) { // LNS CASE
                            formattedMessage = `[${tokenName.replace('.', '\\.')}](https://oasis.cash/token/${token}/${id}) \n\n${name.replace('.', '\\.')} \n\n${message}\n\n[View collection on OASIS](https://oasis.cash/collection/${token})`;
                        }

                        bot.sendMessage(sfwChannelId, formattedMessage, {
                            parse_mode: 'MarkdownV2'
                        });
                    })

                });;
            }
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
                    '🆕 Listed for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' BCH\n'
                    + 'Auction type : ' + translateOrderType(orderInfo.orderType)
                );
            });
        });
    });

    // V2
    oasisContractV2.on('Bid', (token, id, hash, bidder, bidPrice) => {
        console.log('Bid', token, id, hash, bidder, bidPrice)
        sendTgMessage(
            token,
            id,
            '↗️ Received bid for ' + ethers.utils.formatEther(bidPrice.toString()).replace('.', '\\.') + ' BCH');
    });

    // event Claim(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address taker, uint256 price);
    oasisContractV2.on('Claim', (token, id, hash, seller, taker, price) => {
        console.log('Claim', token, id, hash, seller, taker, price)
        sendTgMessage(
            token,
            id,
            '✅ Sold for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' BCH');
    });

    // event MakeOrder(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller);
    oasisContractV2.on('MakeOrder', (token, id, hash, seller) => {
        console.log('MakeOrder', token, id, hash, seller);
        oasisContractV2.getCurrentPrice(hash).then((price) => {
            oasisContractV2.orderInfo(hash).then((orderInfo) => {
                sendTgMessage(
                    token,
                    id,
                    '🆕 Listed for ' + ethers.utils.formatEther(price.toString()).replace('.', '\\.') + ' BCH\n'
                    + 'Auction type: ' + translateOrderType(orderInfo.orderType)
                );
            });
        });
    });
}

main();