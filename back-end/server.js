const express   = require('express');
const cors      = require('cors');
const https      = require('https');   
const app       = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoClient =  require('mongodb').MongoClient;

const ethers = require('ethers');
// const chalk = require('chalk');
const fs = require('fs');

var config;


try {
  config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
} catch (error) {
  console.error(error);
}

var ERC20_ABI = [
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "supply", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "digits", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ name: "remaining", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "_owner", type: "address" },
        { indexed: true, name: "_spender", type: "address" },
        { indexed: false, name: "_value", type: "uint256" },
      ],
      name: "Approval",
      type: "event",
    },
  ];

async function waitTransaction(hash) {
    let receipt = null;
    while (receipt === null) {
      try {
        receipt = await provider.getTransactionReceipt(hash);
      } catch (e) {
        console.log(e);
      }
    }
}

var mainnetUrl = "https://bsc-dataseed.binance.org/";
var provider = new ethers.providers.JsonRpcProvider(mainnetUrl);
// var provider = new ethers.providers.WebSocketProvider(config.provider);

async function getTokenBalance(tokenAddress, provider, address) {
    const abi = [
      {
        name: "balanceOf",
        type: "function",
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        constant: true,
        payable: false,
      },
    ];
  
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(address).catch(() => null);
    return balance;
}

async function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const run = async () => {
    let wallet = new ethers.Wallet(config.private);
  
    let account = wallet.connect(provider);
    let router = new ethers.Contract(
      config.router,
      [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
        "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
      ],
      account
    );
  
    let tokenBalance = await getTokenBalance(
      config.tokenOut,
      provider,
      wallet.address
    );
    let tokenContract = new ethers.Contract(config.tokenOut, ERC20_ABI, account);
  
    let allowance = await tokenContract.allowance(wallet.address, config.router);
    if (allowance < ethers.constants.MaxUint256 / 100)
    {
      const txApprove = await tokenContract
        .approve(config.router, ethers.constants.MaxUint256, {
          gasLimit: "500000",
          gasPrice: ethers.utils.parseUnits(`10`, "gwei"),
        })
        .catch((err) => {
          console.log(err);
          console.log("approve transaction failed...");
        });
    

      await waitTransaction(txApprove.hash);
      console.log(
        `${wallet.address} has successfully approved ${config.tokenName}`
      );
    }
  
    while (true) {
  
      const txSell = await router
      .swapExactTokensForETHSupportingFeeOnTransferTokens(
        ethers.utils.parseUnits(config.sellAmnt, "ether"),
        0,
        [config.tokenOut, config.wbnb, config.usdt],
        wallet.address,
        Date.now() + 1000 * 60 * 10, //10 minutes
        {
          gasLimit: "500000",
          gasPrice: ethers.utils.parseUnits(`10`, "gwei"),
        }
      )
      .catch((err) => {
        console.log(err);
        console.log("transaction failed...");
      });
        await waitTransaction(txSell.hash);
        console.log(
        `${wallet.address} has successfully swapped ${
            config.sellAmnt
        } ${config.tokenName}  to USDT`
        );
    
        await sleep(config.timeout * 3600 * 1000);
  
    }
  
};

const apiRounter = require("./routes/apiRouter");


// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
// fix cors
app.use(cors({
    origin: '*'
}));
    
app.use(bodyParser.json());

//connect to MongoDB
const db_url = "mongodb://127.0.0.1:27017/auto_sale"
mongoose
    .connect(
        db_url,
        { useUnifiedTopology: true, useNewUrlParser: true }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Routes
app.use("/api", apiRounter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server up and running on port ${port}`));
// run();
