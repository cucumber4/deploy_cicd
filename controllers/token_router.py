from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from schemas.notification_scheme import Notification
from schemas.user_scheme import User
from schemas.token_request_scheme import TokenRequest
from utils.dependencies import get_current_user, is_admin
from utils.email_sender import send_token_request_status_email
from web3 import Web3
from pydantic import BaseModel
from dotenv import load_dotenv
import os

router = APIRouter()
load_dotenv()
RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

CONTRACT_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F"
CREATOR_ADDRESS = os.getenv("CREATOR_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=[
    {
        "constant": False,
        "inputs": [{"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "transfer",
        "outputs": [],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/request-tokens")
def request_tokens(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    existing_request = db.query(TokenRequest).filter(
        TokenRequest.user_id == db_user.id, TokenRequest.status == "pending"
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="У вас уже есть активный запрос")


    token_request = TokenRequest(user_id=db_user.id, wallet_address=db_user.wallet_address)
    db.add(token_request)
    db.commit()
    db.refresh(token_request)

    return {"message": "Request sent. Wait for administrator approval."}


@router.get("/token-requests")
def get_token_requests(user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    requests = db.query(TokenRequest).filter(TokenRequest.status == "pending").all()
    return [{"id": req.id, "nickname": req.user.nickname, "wallet_address": req.wallet_address} for req in requests]


@router.post("/approve-request/{request_id}")
def approve_request(request_id: int, user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    request = db.query(TokenRequest).filter(TokenRequest.id == request_id, TokenRequest.status == "pending").first()
    if not request:
        raise HTTPException(status_code=404, detail="Запрос не найден или уже обработан")

    nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
    gas_price = web3.eth.gas_price
    gas_price = int(gas_price * 1.1)

    tx = contract.functions.transfer(request.wallet_address, 10 * 10 ** 18).build_transaction({
        'from': CREATOR_ADDRESS,
        'gas': 200000,
        'gasPrice': gas_price,
        'nonce': nonce,
        'chainId': 11155111
    })

    signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

    request.status = "approved"
    send_token_request_status_email(request.user.email, "approved")

    new_notification = Notification(
        user_id=request.user_id,
        title="✅ Token Request Approved",
        message="Your request for 10 AGA tokens has been approved and tokens have been sent!"
    )
    db.add(new_notification)

    db.commit()

    return {"message": "Tokens sent!", "tx_hash": web3.to_hex(tx_hash)}


@router.post("/reject-request/{request_id}")
def reject_request(request_id: int, user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    request = db.query(TokenRequest).filter(TokenRequest.id == request_id, TokenRequest.status == "pending").first()
    if not request:
        raise HTTPException(status_code=404, detail="Запрос не найден или уже обработан")

    request.status = "rejected"
    send_token_request_status_email(request.user.email, "rejected")

    new_notification = Notification(
        user_id=request.user_id,
        title="❌ Token Request Rejected",
        message="Your request for 10 AGA tokens has been rejected by the administrator."
    )
    db.add(new_notification)

    db.commit()

    return {"message": "Request rejected"}
