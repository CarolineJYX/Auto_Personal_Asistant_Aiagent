from fastapi import APIRouter, HTTPException
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os
import pickle

router = APIRouter()

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    creds = None
    # The file token.pickle stores the user's access and refresh tokens
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)

@router.get("/unread")
async def get_unread_count():
    try:
        service = get_gmail_service()
        
        # Get unread messages in inbox
        results = service.users().messages().list(
            userId='me',
            labelIds=['INBOX', 'UNREAD']
        ).execute()
        
        # Get total number of unread messages
        unread_count = results.get('resultSizeEstimate', 0)
        
        return {
            "success": True,
            "unread_count": unread_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent")
async def get_recent_emails():
    try:
        service = get_gmail_service()
        
        # Get recent messages
        results = service.users().messages().list(
            userId='me',
            maxResults=10,
            labelIds=['INBOX']
        ).execute()
        
        messages = results.get('messages', [])
        email_list = []
        
        for msg in messages:
            message = service.users().messages().get(
                userId='me',
                id=msg['id'],
                format='metadata',
                metadataHeaders=['Subject', 'From', 'Date']
            ).execute()
            
            headers = message['payload']['headers']
            email_data = {
                'id': message['id'],
                'subject': next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject'),
                'from': next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown'),
                'date': next((h['value'] for h in headers if h['name'] == 'Date'), ''),
                'unread': 'UNREAD' in message['labelIds'] if 'labelIds' in message else False
            }
            email_list.append(email_data)
        
        return {
            "success": True,
            "emails": email_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
