import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';

interface Meeting {
  id: number;
  meeting_title: string;
  organizer_name: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  agenda: string;
  meeting_notes: string;
}

interface GettingStartedItem {
  id: string;
  label: string;
  completed: boolean;
  action: () => void;
}

const Meetings = () => {
  const [activeTab, setActiveTab] = useState("gettingStarted");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const myMeetingsRef = useRef<HTMLDivElement>(null);
  const [gettingStartedItems, setGettingStartedItems] = useState<GettingStartedItem[]>([
    {
      id: 'view_meetings',
      label: 'View all meetings',
      completed: false,
      action: () => {
        setGettingStartedItems(prev => 
          prev.map(item => 
            item.id === 'view_meetings' ? { ...item, completed: true } : item
          )
        );
        scrollToMyMeetings();
      }
    },
    {
      id: 'create_meeting',
      label: 'Create new meeting',
      completed: false,
      action: () => {
        setGettingStartedItems(prev => 
          prev.map(item => 
            item.id === 'create_meeting' ? { ...item, completed: true } : item
          )
        );
        setActiveTab('createMeeting');
      }
    },
    {
      id: 'manage_meetings',
      label: 'Manage meetings',
      completed: false,
      action: () => {
        setGettingStartedItems(prev => 
          prev.map(item => 
            item.id === 'manage_meetings' ? { ...item, completed: true } : item
          )
        );
        // Add manage meetings functionality here
      }
    }
  ]);

  const [newMeeting, setNewMeeting] = useState({
    meeting_title: '',
    organizer_name: '',
    meeting_date: '',
    start_time: '',
    end_time: '',
    location: '',
    agenda: '',
    meeting_notes: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/meetings');
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/meetings/create', newMeeting);
      
      if (response.data.success) {
        setNewMeeting({
          meeting_title: '',
          organizer_name: '',
          meeting_date: '',
          start_time: '',
          end_time: '',
          location: '',
          agenda: '',
          meeting_notes: ''
        });
        fetchMeetings();
        setActiveTab('myMeetings');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const scrollToMyMeetings = () => {
    setActiveTab("myMeetings");
    myMeetingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === "gettingStarted" && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6 mb-6">
              <h1 className="text-2xl font-semibold text-purple-900">Welcome to Meetings! 🎯</h1>
              <p className="mt-2 text-purple-600">Let's help you get started with managing your meetings effectively.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-6">Getting started</h2>
              <div className="space-y-4">
                {gettingStartedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center p-4 rounded-lg hover:bg-purple-50 transition-colors duration-150"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-purple-100' : 'bg-purple-50'
                    }`}>
                      {item.completed ? (
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-purple-300"></div>
                      )}
                    </div>
                    <span className={`ml-3 text-lg ${
                      item.completed ? 'text-purple-400' : 'text-purple-900'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={myMeetingsRef} className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
          {activeTab === "myMeetings" && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">My Meetings</h2>
              {loading ? (
                <p className="text-purple-600">Loading meetings...</p>
              ) : meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50">
                      <h3 className="text-lg font-medium text-purple-900">{meeting.meeting_title}</h3>
                      <p className="text-purple-600 mt-1">Organizer: {meeting.organizer_name}</p>
                      <div className="mt-2 text-purple-500">
                        <p>Date: {meeting.meeting_date}</p>
                        <p>Time: {meeting.start_time} - {meeting.end_time}</p>
                        <p>Location: {meeting.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-600">No meetings found. Create one to get started!</p>
              )}
            </div>
          )}
        </div>

        {activeTab === "createMeeting" && (
          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">Create New Meeting</h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label htmlFor="meeting_title" className="block text-sm font-medium text-purple-700">Meeting Title</label>
                <input
                  type="text"
                  id="meeting_title"
                  name="meeting_title"
                  value={newMeeting.meeting_title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Organizer Name</label>
                <input
                  type="text"
                  name="organizer_name"
                  value={newMeeting.organizer_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700">Date</label>
                  <input
                    type="date"
                    name="meeting_date"
                    value={newMeeting.meeting_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={newMeeting.start_time}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={newMeeting.end_time}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newMeeting.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Agenda</label>
                <textarea
                  name="agenda"
                  value={newMeeting.agenda}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700">Meeting Notes</label>
                <textarea
                  name="meeting_notes"
                  value={newMeeting.meeting_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border-purple-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("myMeetings")}
                  className="px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Meeting"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;
