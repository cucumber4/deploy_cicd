from web3 import Web3

from transaction_count import CREATOR_ADDRESS, PRIVATE_KEY

web3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"))

account = "0xF1f113B33365EAe18F7e4504E50E57679816090B"
private_key = "ff3b75ea3cd0bfed0c2a9032fd6c9690bedcbe24f36c3a1350f5001bfd5adecc"

nonce = web3.eth.get_transaction_count(account, "pending")
print(f"Текущий nonce: {nonce}")

tx = {
    'to': CREATOR_ADDRESS,
    'value': 1,
    'gas': 21000,
    'gasPrice': int(web3.eth.gas_price * 1.5),
    'nonce': nonce,  # актуальный nonce
    'chainId': 11155111
}

signed_tx = web3.eth.account.sign_transaction(tx, private_key)

tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"Очистка nonce отправлена! TX Hash: {web3.to_hex(tx_hash)}")
