
from webapp.models import Category, Movie, User
from django.core import serializers
from django.db.models import Q
from django.core.cache import cache
from google.oauth2 import service_account
from googleapiclient.discovery import build

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Task

import requests
from lxml import etree


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
    print(request)

    data = json.loads(request.body.decode('utf-8'))

    if not data:
        data = {
            'success': False,
            'msg': 'Parameter Wrong',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    id = 1
    user = User.objects.filter(id=id).first()
    if not user:
        data = {
            'success': False,
            'msg': 'The user does not exist.',
            'data': {}
        }
        return JsonResponse(data, safe=False)
    data = {
        'success': True,
        'msg': 'Obtaining user information succeeded',
        'data': serializers.serialize('python', [user])[0]
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

def get_tasks(request):
    tasks = Task.objects.all()
    tasks_data = [
        {
            "id": task.id,
            "name": task.name,
            "description": task.description,
            "assigned_to": task.assigned_to,
            "priority": task.priority,
            "status": task.status,
            "start_date": task.start_date,
            "end_date": task.end_date,
        }
        for task in tasks
    ]
    return JsonResponse({"success": True, "tasks": tasks_data})

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task = Task.objects.create(
                name=data.get('name'),
                description=data.get('description'),
                assigned_to=data.get('assigned_to'),
                priority=data.get('priority'),
                status=data.get('status'),
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                task_summary=data.get('task_summary'),
            )
            # Добавляем задачу в Google Calendar
            calendar_event_id = add_to_google_calendar(task)
            return JsonResponse({"success": True, "task_id": task.id, "calendar_event_id": calendar_event_id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method"})
