from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
import requests
import datetime

# N8N webhook URL for email sending
WEBHOOK_URL = 'https://mirawang.app.n8n.cloud/webhook/9c10a798-1df0-442b-ab5a-0d90e4166814'

@csrf_exempt
@require_http_methods(["POST"])
def send_email(request):
    try:
        data = json.loads(request.body)
        to_email = data.get('to')
        subject = data.get('subject')
        body = data.get('body')
        recipient_name = data.get('recipientName')

        print(f"\n=== SENDING EMAIL ===")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Recipient: {recipient_name}")

        if not all([to_email, subject, body]):
            missing_fields = [field for field, value in {
                'to': to_email,
                'subject': subject,
                'body': body
            }.items() if not value]
            
            error_msg = f'Missing required fields: {", ".join(missing_fields)}'
            print(f"Error: {error_msg}")
            return JsonResponse({
                'success': False,
                'error': error_msg
            }, status=400)

        # Forward the request to n8n webhook
        try:
            print("\nSending request to n8n webhook...")
            
            # Format the request to match n8n expectations
            webhook_data = {
                'message': body,
                'template': {
                    'subject': subject,
                    'content': body
                },
                'contact': {
                    'email': to_email,
                    'name': recipient_name
                },
                'action': 'send_email'
            }
            
            print("Webhook payload:", json.dumps(webhook_data, indent=2))
            
            response = requests.post(
                WEBHOOK_URL,
                json=webhook_data,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout=10
            )
            
            print(f"n8n response status: {response.status_code}")
            print(f"n8n response body: {response.text}")
            
            if response.status_code == 200:
                try:
                    n8n_response = response.json()
                    if isinstance(n8n_response, dict) and n8n_response.get('success', False):
                        success_msg = f'Email sent successfully to {recipient_name}'
                        print(f"Success: {success_msg}")
                        return JsonResponse({
                            'success': True,
                            'message': success_msg
                        })
                    else:
                        error_msg = n8n_response.get('error', 'Failed to send email through n8n')
                        print(f"Error from n8n: {error_msg}")
                        return JsonResponse({
                            'success': False,
                            'error': error_msg
                        }, status=500)
                except json.JSONDecodeError:
                    # Handle case where response is not JSON
                    if "success" in response.text.lower():
                        success_msg = f'Email sent successfully to {recipient_name}'
                        print(f"Success: {success_msg}")
                        return JsonResponse({
                            'success': True,
                            'message': success_msg
                        })
                    else:
                        error_msg = 'Invalid response format from n8n'
                        print(f"Error: {error_msg}")
                        return JsonResponse({
                            'success': False,
                            'error': error_msg
                        }, status=500)
            else:
                error_msg = f'n8n service returned status code {response.status_code}'
                print(f"Error: {error_msg}")
                print(f"Response body: {response.text}")
                return JsonResponse({
                    'success': False,
                    'error': error_msg
                }, status=response.status_code)

        except requests.Timeout:
            error_msg = "Request to n8n service timed out"
            print(f"Error: {error_msg}")
            return JsonResponse({
                'success': False,
                'error': error_msg
            }, status=504)
        except requests.RequestException as e:
            error_msg = f"Error connecting to n8n service: {str(e)}"
            print(f"Error: {error_msg}")
            return JsonResponse({
                'success': False,
                'error': error_msg
            }, status=502)

    except json.JSONDecodeError:
        error_msg = "Invalid JSON data in request"
        print(f"Error: {error_msg}")
        return JsonResponse({
            'success': False,
            'error': error_msg
        }, status=400)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"Error: {error_msg}")
        return JsonResponse({
            'success': False,
            'error': error_msg
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def ai_message(request):
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        context = data.get('context', [])
        
        # Forward the request to n8n webhook
        try:
            response = requests.post(
                'https://mirawang.app.n8n.cloud/webhook/9c10a798-1df0-442b-ab5a-0d90e4166814',
                json={
                    'message': message,
                    'context': context,
                    'timestamp': datetime.datetime.now().isoformat()
                },
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                return JsonResponse({
                    'success': True,
                    'response': ai_response.get('response', "I understand. How else can I help you?"),
                    'action': ai_response.get('action', None)
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'AI service returned status code {response.status_code}'
                }, status=response.status_code)
                
        except requests.Timeout:
            return JsonResponse({
                'success': False,
                'error': 'Request to AI service timed out'
            }, status=504)
        except requests.RequestException as e:
            return JsonResponse({
                'success': False,
                'error': f'Error connecting to AI service: {str(e)}'
            }, status=502)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def home(request):
    return JsonResponse({'status': 'ok'})
