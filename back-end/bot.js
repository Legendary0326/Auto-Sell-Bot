import ethers from "ethers";
import chalk from "chalk";
import fs from "fs";

var config;

console.log(chalk.yellow(`Start Sell token...`));

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

async function sendToken(
  contract_address,
  send_token_amount,
  to_address,
  send_account,
  private_key
) {
  const send_abi = [
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  let wallet = new ethers.Wallet(private_key);
  let walletSigner = wallet.connect(provider);

  if (contract_address) {
    // general token send
    let contract = new ethers.Contract(
      contract_address,
      send_abi,
      walletSigner
    );

    // How many tokens?
    let numberOfTokens = ethers.utils.parseUnits(send_token_amount, 18);
    // Send tokens
    const txTransfer = await contract
      .transfer(to_address, numberOfTokens)
      .catch(() => null);
    await waitTransaction(txTransfer.hash).catch(() => null);
  }
}

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

async function sendBNB(
  send_token_amount,
  to_address,
  send_account,
  private_key
) {
  try {
    let wallet = new ethers.Wallet(private_key);
    let walletSigner = wallet.connect(provider);
    const tx = {
      to: to_address,
      value: ethers.utils.parseEther(send_token_amount),
    };
    const txTransfer = await walletSigner.sendTransaction(tx);
    await waitTransaction(txTransfer.hash);
    console.log(
      `Sent ${send_token_amount} BNB from ${send_account} to ${to_address}`
    );
  } catch (error) {
    console.error("Promise failed");
    console.error(error);
  }
}

var mainnetUrl = "https://bsc-dataseed.binance.org/";
// var provider = new ethers.providers.JsonRpcProvider(mainnetUrl);
var provider = new ethers.providers.WebSocketProvider(config.wssProvider);

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

async function getBalance(provider, addr) {
  const balance = await provider.getBalance(addr);
  return balance;
}

async function getNonce(addr) {
  const nonce = await provider.getTransactionCount(addr);
  return nonce;
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

run();
