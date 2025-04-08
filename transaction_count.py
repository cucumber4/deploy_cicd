from web3 import Web3

CREATOR_ADDRESS = "0xF1f113B33365EAe18F7e4504E50E57679816090B"
PRIVATE_KEY = "ff3b75ea3cd0bfed0c2a9032fd6c9690bedcbe24f36c3a1350f5001bfd5adecc"

RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")

pending_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")
print(f"Pending Nonce: {pending_nonce}, Latest Nonce: {latest_nonce}")
print(latest_nonce)
