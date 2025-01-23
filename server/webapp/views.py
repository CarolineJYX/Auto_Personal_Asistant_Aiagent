from webapp.models import Category, Movie, User, Meeting, Task
from django.core import serializers
from django.db.models import Q
from django.core.cache import cache
from google.oauth2 import service_account
from googleapiclient.discovery import build

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Task
import requests
from lxml import etree
import datetime

# Create your views here.


def get_top_movie_url() -> list:
    url = 'https://www.boxofficemojo.com/chart/top_lifetime_gross/?area=XWW'
    response = requests.get(url)
    if response.status_code == 200:
        html = etree.HTML(response.content)
        #  //table[2]/tbody/tr/td[2]/a/@href
        urls = []
        for i in html.xpath('//table//td[2]/a/@href')[:10]:
            url = 'https://www.boxofficemojo.com' + i
            urls.append(url)
        return urls

    else:
        return []


# img
# name
# release_time
# desc
# director
# score
# duration

def get_movie_info(url: str) -> dict:
    response = requests.get(url)
    if response.status_code == 200:
        html = etree.HTML(response.content)
        img = html.xpath('//*[@id="a-page"]/main/div/div[1]/div[1]/div/div/div[1]/img//@src')[0]
        name = html.xpath('//h1[@class="a-size-extra-large"]/text()')[0]
        release_time = html.xpath('/html/body/div[1]/main/div/div[1]/div[1]/div/div/div[2]/div/h1/span/text()')[0][2:6]
        desc = html.xpath(
            '/html/body/div[1]/main/div/div[1]/div[1]/div/div/div[2]/div/span/text()')[
            0]
        director = html.xpath(
            '/html/body/div[1]/main/div/div[3]/div[4]/div[5]/span[2]/text()')[
            0]
        score = 9.3
        duration = html.xpath(
            '/html/body/div[1]/main/div/div[3]/div[4]/div[6]/span[2]/text()')[
            0]
        return {
            'img': img,
            'name': name,
            'release_time': release_time,
            'desc': desc,
            'director': director,
            'score': score,
            'duration': duration
        }
    else:
        return {}


def index(request):
    if request.method == 'GET':
        data = {
            'success': True,
            'msg': 'Welcome to the API',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        data = {
            'success': False,
            'msg': 'Invalid JSON data',
            'data': {}
        }
        return JsonResponse(data, safe=False)

    if not data:
        data = {
            'success': False,
            'msg': 'Parameter Wrong',
            'data': {}
        }
    return JsonResponse(data, safe=False)


def login(request):
    data = json.loads(request.body.decode('utf-8'))
    username = data.get('username')
    password = data.get('password')
    user = User.objects.filter(username=username, password=password).first()
    if not user:
        data = {
            'success': False,
            'msg': 'The user does not exist',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    if user.username != username or user.password != password:
        data = {
            'success': False,
            'msg': 'Password Wrong',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    data = {
        'success': True,
        'msg': 'Login Succ',
        'data': {
            'id': user.id,
        }
    }
    return JsonResponse(data, safe=False)


#  Create a user registration
def register(request):
    data = json.loads(request.body.decode('utf-8'))
    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    email = data.get('email')
    user = User.objects.filter(username=username).first()
    if user:
        data = {
            'success': False,
            'msg': 'The user already exists',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    user = User.objects.create(username=username, password=password, email=email, phone=phone)
    data = {
        'success': True,
        'msg': 'Registered Successfully',
        'data': {
            'id': user.id
        }
    }
    return JsonResponse(data, safe=False)


# Get user information
def get_user(request):
    data = json.loads(request.body.decode('utf-8'))
    id = data.get('id')
    user = User.objects.filter(id=id).first()
    if not user:
        data = {
            'success': False,
            'msg': 'The user does not exist',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    data = {
        'success': True,
        'msg': 'Obtaining user information succeeded',
        'data': serializers.serialize('python', [user])[0]
    }
    return JsonResponse(data, safe=False)


# Update user information
def update_user(request):
    data = json.loads(request.body.decode('utf-8'))
    id = data.get('id')
    user = User.objects.filter(id=id).first()
    if not user:
        data = {
            'success': False,
            'msg': 'The user does not exist',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    user.password = data.get('password')
    user.email = data.get('email')
    user.phone = data.get('phone')
    user.sex = data.get('sex')
    user.save()
    data = {
        'success': True,
        'msg': 'Update User Info Succ',
        'data': serializers.serialize('python', [user])[0]
    }
    return JsonResponse(data, safe=False)


# Get all movies and return them grouped by category
def get_movies(request):
    data = json.loads(request.body.decode('utf-8'))
    name = data.get('name')
    # Get all categories
    categories = Category.objects.all()
    list = []
    # Create a dictionary to store a list of movies for each category
    category_data = []
    for category in categories:
        # Get Movies from specified category
        movies = Movie.objects.filter(category=category).filter(
            Q(name__icontains=name) |
            Q(desc__icontains=name) |
            Q(director__icontains=name) |
            Q(actor__icontains=name))
        
        movie_list = serializers.serialize('python', movies)
        if len(movie_list) == 0 or not movie_list:
            continue
        # Construct data structure of each category
        category_entry = {
            'name': category.name,
            'list': movie_list
        }
        list.append(category.name)
        # Add category data into list
        category_data.append(category_entry)

    # Construct Response Data
    data = {
        'success': True,
        'msg': 'Get Movie List Succ',
        'data': category_data,
        'list': list
    }
    return JsonResponse(data, safe=False)


def all(request):
    movies = Movie.objects.all()
    movie_list = serializers.serialize('python', movies)
    data = {
        'success': True,
        'msg': 'Get Movie List Succ',
        'data': movie_list
    }
    return JsonResponse(data, safe=False)


top_data = {}


def top(request):
    # Check if the data is cached
    top_data = cache.get('top_data')
    if top_data:
        return JsonResponse(top_data, safe=False)

    # If data is not cached, fetch it
    urls = get_top_movie_url()
    data = []
    for url in urls:
        data.append(get_movie_info(url))

    # Store the data in the cache for future use
    top_data = {
        'success': True,
        'msg': 'Get Movie List Succ',
        'data': data
    }
    cache.set('top_data', top_data)

    return JsonResponse(top_data, safe=False)

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
SERVICE_ACCOUNT_FILE = '../server/webapp/credentials.json'  # Укажите путь к вашему credentials.json

def get_google_calendar_events(request):
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('calendar', 'v3', credentials=credentials)

    events_result = service.events().list(
        calendarId='primary', maxResults=10, singleEvents=True, orderBy='startTime').execute()
    events = events_result.get('items', [])

    return JsonResponse({'success': True, 'events': events})

def add_to_google_calendar(task):
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    creds = service_account.Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
    service = build('calendar', 'v3', credentials=creds)

    event = {
        'summary': task.name,
        'description': task.description,
        'start': {
            'dateTime': task.start_date.isoformat(),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': task.end_date.isoformat(),
            'timeZone': 'UTC',
        },
    }

    event_result = service.events().insert(calendarId='primary', body=event).execute()
    return event_result.get('id')

@csrf_exempt
def get_tasks(request):
    try:
        tasks = Task.objects.all()
        tasks_data = [
            {
                "id": task.id,
                "name": task.task_name,
                "description": task.task_description,
                "priority": task.priority,
                "status": task.task_status,
                "start_date": task.start_date_time.isoformat() if task.start_date_time else None,
                "end_date": task.end_date_time.isoformat() if task.end_date_time else None,
            }
            for task in tasks
        ]
        return JsonResponse({"success": True, "tasks": tasks_data})
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task = Task.objects.create(
                task_name=data.get('name'),
                task_description=data.get('description', ''),
                priority=data.get('priority', 'MEDIUM'),
                task_status=data.get('status', 'NOT_STARTED'),
                start_date_time=data.get('start_date'),
                end_date_time=data.get('end_date'),
                task_summary=data.get('description', '')  # Use description as summary if not provided
            )
            
            return JsonResponse({
                "success": True,
                "task": {
                    "id": task.id,
                    "name": task.task_name,
                    "description": task.task_description,
                    "priority": task.priority,
                    "status": task.task_status,
                    "start_date": task.start_date_time,
                    "end_date": task.end_date_time
                }
            })
        except Exception as e:
            print(f"Error creating task: {str(e)}")  # Add logging
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)

import requests

# N8N webhook URL
WEBHOOK_URL = 'https://mirawang.app.n8n.cloud/webhook/9c10a798-1df0-442b-ab5a-0d90e4166814'

@csrf_exempt
def handle_ai_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            
            # Forward to n8n webhook
            try:
                webhook_response = requests.post(
                    WEBHOOK_URL,
                    json={
                        'message': user_message,
                        'type': 'email',
                        'timestamp': str(datetime.datetime.now())
                    },
                    headers={
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout=10  # 10 second timeout
                )
                
                # Log the response for debugging
                print(f"N8N Response: {webhook_response.status_code} - {webhook_response.text}")
                
                if webhook_response.status_code in [200, 201]:
                    return JsonResponse({
                        'success': True,
                        'message': 'Email request sent successfully',
                        'response': webhook_response.json() if webhook_response.text else {}
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'error': f'Failed to process email request: {webhook_response.text}'
                    }, status=webhook_response.status_code)
                    
            except requests.RequestException as e:
                print(f"Error sending to n8n: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'error': f'Failed to connect to email service: {str(e)}'
                }, status=500)

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid request format'
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'error': 'Method not allowed'
    }, status=405)

@csrf_exempt
def get_meetings(request):
    print("\n=== GET MEETINGS ===")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    
    try:
        print("\nFetching all meetings from database...")
        meetings = Meeting.objects.all()
        print(f"Found {len(meetings)} meetings")
        
        meetings_data = []
        for meeting in meetings:
            meeting_data = {
                "id": meeting.id,
                "meeting_title": meeting.meeting_title,
                "organizer_name": meeting.organizer_name,
                "meeting_date": meeting.meeting_date,
                "start_time": meeting.start_time,
                "end_time": meeting.end_time,
                "location": meeting.location,
                "agenda": meeting.agenda,
                "meeting_notes": meeting.meeting_notes,
            }
            meetings_data.append(meeting_data)
            print(f"\nMeeting {meeting.id}:", meeting_data)
        
        response_data = {"success": True, "meetings": meetings_data}
        print("\nSending response:", response_data)
        
        response = JsonResponse(response_data)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
    except Exception as e:
        error_msg = str(e)
        print(f"\nError in get_meetings: {error_msg}")
        return JsonResponse({"success": False, "error": error_msg}, status=500)

@csrf_exempt
def create_meeting(request):
    print("\n=== CREATE MEETING ===")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    
    if request.method == "POST":
        try:
            print("\nParsing request body...")
            body = request.body.decode('utf-8')
            print("Raw request body:", body)
            
            data = json.loads(body)
            print("\nParsed data:", data)
            
            # Validate required fields
            required_fields = ['meeting_title', 'organizer_name', 'meeting_date', 'start_time', 'end_time', 'location']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                error_msg = f"Missing required fields: {', '.join(missing_fields)}"
                print(f"\nValidation error: {error_msg}")
                return JsonResponse({"success": False, "error": error_msg}, status=400)
            
            print("\nCreating meeting in database...")
            meeting = Meeting.objects.create(
                meeting_title=data.get('meeting_title'),
                organizer_name=data.get('organizer_name'),
                meeting_date=data.get('meeting_date'),
                start_time=data.get('start_time'),
                end_time=data.get('end_time'),
                location=data.get('location'),
                agenda=data.get('agenda', ''),
                meeting_notes=data.get('meeting_notes', '')
            )
            print("Meeting created:", meeting.__dict__)
            
            # Add to Google Calendar
            try:
                print("\nAdding to Google Calendar...")
                event = {
                    'summary': meeting.meeting_title,
                    'location': meeting.location,
                    'description': meeting.agenda,
                    'start': {
                        'dateTime': f"{meeting.meeting_date}T{meeting.start_time}:00",
                        'timeZone': 'UTC',
                    },
                    'end': {
                        'dateTime': f"{meeting.meeting_date}T{meeting.end_time}:00",
                        'timeZone': 'UTC',
                    },
                }
                print("Calendar event data:", event)
                
                credentials = service_account.Credentials.from_service_account_file(
                    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
                service = build('calendar', 'v3', credentials=credentials)
                event_result = service.events().insert(calendarId='primary', body=event).execute()
                print("Added to calendar, event ID:", event_result.get('id'))
            except Exception as e:
                print(f"Failed to add to calendar: {str(e)}")
            
            response_data = {
                "success": True,
                "meeting": {
                    "id": meeting.id,
                    "meeting_title": meeting.meeting_title,
                    "organizer_name": meeting.organizer_name,
                    "meeting_date": meeting.meeting_date,
                    "start_time": meeting.start_time,
                    "end_time": meeting.end_time,
                    "location": meeting.location,
                    "agenda": meeting.agenda,
                    "meeting_notes": meeting.meeting_notes,
                }
            }
            print("\nSending response:", response_data)
            
            response = JsonResponse(response_data)
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type"
            return response
            
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON data: {str(e)}"
            print(f"\nJSON decode error: {error_msg}")
            return JsonResponse({"success": False, "error": error_msg}, status=400)
        except Exception as e:
            error_msg = str(e)
            print(f"\nError creating meeting: {error_msg}")
            print("Exception type:", type(e))
            import traceback
            print("Traceback:", traceback.format_exc())
            return JsonResponse({"success": False, "error": error_msg}, status=400)
    
    # Handle OPTIONS request for CORS
    if request.method == "OPTIONS":
        print("\nHandling OPTIONS request")
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
        
    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)
