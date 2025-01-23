from django.db import models


# Create your models here.

# Movie classification: One-to-Many
class Category(models.Model):
    id = models.AutoField(primary_key=True, verbose_name='Category id')
    name = models.CharField(max_length=20, verbose_name='Category Name')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Movie Category'
        verbose_name_plural = verbose_name


# Movie Information
class Movie(models.Model):
    id = models.AutoField(primary_key=True, verbose_name='Movie id')
    name = models.CharField(max_length=100, verbose_name='Movie Name')
    desc = models.TextField(verbose_name='Movie Description')
    score = models.FloatField(default=0, verbose_name='Movie Rating')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Movie Category')
    # Movie Picture
    img = models.ImageField(upload_to='movie', verbose_name='Movie Picture')
    # Release Time of Movie
    release_time = models.DateField(verbose_name='Release Time')
    # Movie Length
    duration = models.IntegerField(verbose_name='Movie Length')
    # Director
    director = models.CharField(max_length=20, verbose_name='Director')
    # Actors
    actor = models.CharField(max_length=100, verbose_name='Actors')
    # Region
    area = models.CharField(max_length=20, verbose_name='Region', default='Singapore')
    # Language
    language = models.CharField(max_length=20, verbose_name='Language', default='English')
    # Release Status
    status = models.CharField(max_length=20, verbose_name='Status', default='Released')
    # Play Address
    url = models.CharField(max_length=100, verbose_name='Play Address', default='https://www.baidu.com')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Movie Info'
        verbose_name_plural = verbose_name
        ordering = ('id',)



# User
class User(models.Model):
    id = models.AutoField(primary_key=True, verbose_name='User id')
    username = models.CharField(max_length=20, verbose_name='Username')
    password = models.CharField(max_length=20, verbose_name='Password')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=11, verbose_name='Phone Number')
    # User Avatar
    img = models.ImageField(upload_to='user/', verbose_name='User Avatar', default='user/default.jpg')
    # User Gender
    sex = models.CharField(max_length=10, verbose_name='Gender', default='Male')

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = verbose_name
# Task Management
class Task(models.Model):
    task_name = models.CharField(max_length=100)
    task_description = models.TextField()
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tasks")
    priority = models.CharField(max_length=10, choices=[("High", "High"), ("Medium", "Medium"), ("Low", "Low")])
    task_status = models.CharField(max_length=15, choices=[("Not Started", "Not Started"), ("In Progress", "In Progress"), ("Completed", "Completed")])
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()
    associated_event_id = models.IntegerField(null=True, blank=True)
    attachments = models.TextField(null=True, blank=True)  # Store file links as comma-separated
    task_summary = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.task_name

# Meeting Management
class Meeting(models.Model):
    meeting_title = models.CharField(max_length=100)
    organizer_name = models.CharField(max_length=50)
    participants = models.ManyToManyField(User, related_name="meetings", blank=True)
    meeting_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=100)
    agenda = models.TextField(null=True, blank=True)
    meeting_notes = models.TextField(null=True, blank=True)
    attachments = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.meeting_title

# Email Support
class Email(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sent_emails")
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="received_emails")
    subject = models.CharField(max_length=200)
    body = models.TextField()
    attachments = models.TextField(null=True, blank=True)
    template_id = models.IntegerField(null=True, blank=True)
    ai_summary = models.TextField(null=True, blank=True)
    sent_date_time = models.DateTimeField()

    def __str__(self):
        return self.subject

# Reports
class Report(models.Model):
    report_type = models.CharField(max_length=50, choices=[("Personal", "Personal"), ("Project", "Project")])
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="reports")
    generated_date_time = models.DateTimeField()
    time_range_start = models.DateTimeField()
    time_range_end = models.DateTimeField()
    indicators_tracked = models.TextField()  # E.g., "Tasks Progress, Meeting Attendance"
    ai_summary = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.report_type} Report by {self.generated_by}"

# AI Agent
class Interaction(models.Model):
    command_type = models.CharField(max_length=50, choices=[("Schedule Task", "Schedule Task"), ("Check Progress", "Check Progress")])
    input_command = models.TextField()
    associated_task_meeting_id = models.IntegerField(null=True, blank=True)
    response_type = models.CharField(max_length=50, choices=[("Chat", "Chat"), ("Action", "Action")])
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.command_type} at {self.timestamp}"

# Reminders
class Reminder(models.Model):
    reminder_type = models.CharField(max_length=50, choices=[("Email", "Email"), ("Notification", "Notification"), ("Dashboard", "Dashboard")])
    associated_task_meeting_id = models.IntegerField()
    reminder_date_time = models.DateTimeField()
    status = models.CharField(max_length=50, choices=[("Sent", "Sent"), ("Pending", "Pending")])

    def __str__(self):
        return f"Reminder for {self.associated_task_meeting_id}"

# Calendar
class Calendar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="calendar")
    date = models.DateField()
    time_block_start = models.TimeField()
    time_block_end = models.TimeField()
    associated_task_meeting_id = models.IntegerField()
    conflict_status = models.BooleanField(default=False)

    def __str__(self):
        return f"Calendar Entry for {self.user}"
