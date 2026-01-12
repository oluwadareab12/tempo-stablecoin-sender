console.log("script.js loaded");
function onTokenChange() {
  if (!provider || !userAccount) return;
  refreshBalance();
}
const BATCH_CONTRACT_ADDRESS =
  "0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141";
const statusText = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const sendBtn = document.getElementById("sendBtn");

const toInput = document.getElementById("toAddress");
const amountInput = document.getElementById("amount");

let provider;
let signer;
let userAccount;
const TOKEN_ADDRESSES = {
  ALPHA: "0x20c0000000000000000000000000000000000001",
  BETA:  "0x20c0000000000000000000000000000000000002",
  THETA: "0x20c0000000000000000000000000000000000003"
};
function getSelectedTokenAddress() {
  const tokenKey = document.getElementById("tokenSelect").value;

  if (!tokenKey) {
    alert("Please select a token");
    return null;
  }

  return TOKEN_ADDRESSES[tokenKey];
}



const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const BATCH_ABI = [
  "function sendTokens(address token, address[] recipients, uint256[] amounts) external"
];


connectBtn.onclick = async () => {
  if (!window.ethereum) {
    statusText.innerText = "MetaMask not found";
    return;
  }

  await ethereum.request({ method: "eth_requestAccounts" });

  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  userAccount = await signer.getAddress();

  statusText.innerText = "Connected: " + userAccount;

};

sendBtn.onclick = async () => {
  try {
    const tokenAddress = getSelectedTokenAddress();
    if (!tokenAddress) return;

    const recipients = toInput.value
      .split("\n")
      .map(a => a.trim())
      .filter(a => a);

    if (recipients.length === 0 || recipients.length > 10) {
      statusText.innerText = "Enter 1–10 recipient addresses";
      return;
    }

    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const decimals = await token.decimals();

    const amountPerAddress =
      ethers.utils.parseUnits(amountInput.value, decimals);

    const amounts = recipients.map(() => amountPerAddress);

    const totalAmount =
      amountPerAddress.mul(recipients.length);

    // Step 1: Approve once
    statusText.innerText = "Approving token spend...";
    const approveTx =
      await token.approve(BATCH_CONTRACT_ADDRESS, totalAmount);
    await approveTx.wait();

    // Step 2: Batch send (ONE MetaMask popup)
    const batch = new ethers.Contract(
      BATCH_CONTRACT_ADDRESS,
      BATCH_ABI,
      signer
    );

    statusText.innerText = "Sending batch transaction...";
    const tx = await batch.sendTokens(
      tokenAddress,
      recipients,
      amounts
    );

    await tx.wait();
    await refreshBalance();

    statusText.innerText =
      "✅ Batch transfer complete (one transaction)";
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Batch transfer failed";
  }
};

async function refreshBalance() {
  const tokenAddress = getSelectedTokenAddress();
  if (!tokenAddress) return;

  const token = new ethers.Contract(
    tokenAddress,
    TOKEN_ABI,
    provider
  );

  const balance = await token.balanceOf(userAccount);
  const decimals = await token.decimals();

  const readable = ethers.utils.formatUnits(balance, decimals);

  statusText.innerText =
    `Connected: ${userAccount} | Balance: ${readable}`;
}


