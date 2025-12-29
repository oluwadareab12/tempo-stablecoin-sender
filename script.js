const statusText = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const sendBtn = document.getElementById("sendBtn");

const toInput = document.getElementById("toAddress");
const amountInput = document.getElementById("amount");

let provider;
let signer;
let userAccount;

const TOKEN_ADDRESS = "0x20c0000000000000000000000000000000000001"; // AlphaUSD

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
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
  await refreshBalance();

};

sendBtn.onclick = async () => {
  try {
    const to = toInput.value;
    const amount = amountInput.value;

    if (!to || !amount) {
      statusText.innerText = "Fill in address and amount";
      return;
    }

    sendBtn.disabled = true;
    statusText.innerText = "Preparing transaction...";

    const token = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      signer
    );

    const decimals = await token.decimals();
    const parsedAmount = ethers.utils.parseUnits(amount, decimals);

    statusText.innerText = "Sending transaction...";

    const tx = await token.transfer(to, parsedAmount);

    statusText.innerText = `Transaction sent: ${tx.hash}`;

    await tx.wait();
    await refreshBalance();


    statusText.innerText = `✅ Transfer confirmed!\nTx: ${tx.hash}`;

    sendBtn.disabled = false;
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Transaction failed";
    sendBtn.disabled = false;
  }
};
async function refreshBalance() {
  const token = new ethers.Contract(
    TOKEN_ADDRESS,
    TOKEN_ABI,
    provider
  );

  const balance = await token.balanceOf(userAccount);
  const decimals = await token.decimals();

  const readable = ethers.utils.formatUnits(balance, decimals);

  statusText.innerText = `Connected: ${userAccount} | Balance: ${readable}`;
}

