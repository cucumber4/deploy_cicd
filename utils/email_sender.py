import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.mailgun.org"  # адрес SMTP-сервера
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_verification_email(recipient_email: str, code: str):
    subject = "Ваш код подтверждения регистрации"
    body = f"Ваш код подтверждения: {code}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

# send_verification_email('gogoreferenc@gmail.com', '546532')

def send_poll_status_email(recipient_email: str, poll_name: str, status: str):
    subject = f"Your poll '{poll_name}' has been {status}"
    body = f"Hello!\n\nYour poll '{poll_name}' has been {status} by the admin.\n\nThank you for using our platform!"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)


def send_token_request_status_email(recipient_email: str, status: str):
    subject = "AGA Token Request Status"
    if status == "approved":
        body = "Hello!\n\nYour request for 10 AGA tokens has been approved! The tokens have been sent to your wallet.\n\nThank you for using our platform!"
    else:
        body = "Hello!\n\nUnfortunately, your request for 10 AGA tokens has been rejected by the administrator.\n\nThank you for using our platform."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)