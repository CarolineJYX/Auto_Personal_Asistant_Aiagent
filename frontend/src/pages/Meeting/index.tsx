import React, { useState, useEffect } from "react";
import Card from '@/components/card'
import { useMeetings } from '@/context/MeetingsContext';
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

const Meeting = () => {
  const [activeTab, setActiveTab] = useState("myMeetings");
  const { meetings, loading, error, fetchMeetings } = useMeetings();
  const [formData, setFormData] = useState({
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
    if (activeTab === "myMeetings") {
      fetchMeetings();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting meeting data:', formData);
      
      // Send POST request to create meeting
      const response = await axios.post('http://localhost:8000/meetings/create', formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        // Clear form
        setFormData({
          meeting_title: '',
          organizer_name: '',
          meeting_date: '',
          start_time: '',
          end_time: '',
          location: '',
          agenda: '',
          meeting_notes: ''
        });
        
        // Switch to meetings tab and refresh list
        setActiveTab("myMeetings");
        
        // Fetch updated meetings list
        await fetchMeetings();
        
        alert('Meeting created successfully!');
      } else {
        console.error('Failed to create meeting:', response.data.error);
        alert(response.data.error || 'Failed to create meeting');
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      alert(error.response?.data?.error || 'Failed to create meeting. Please try again.');
    }
  };

  const renderMyMeetings = () => {
    if (loading) {
      return <div className="text-center py-4">Loading meetings...</div>;
    }

    if (error) {
      return <div className="text-red-600 py-4">{error}</div>;
    }

    if (!meetings || meetings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No meetings found.</p>
          <button
            onClick={() => setActiveTab("createMeeting")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create Your First Meeting
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{meeting.meeting_title}</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Organizer:</strong> {meeting.organizer_name}</p>
              <p><strong>Date:</strong> {meeting.meeting_date}</p>
              <p><strong>Time:</strong> {meeting.start_time} - {meeting.end_time}</p>
              <p><strong>Location:</strong> {meeting.location}</p>
              {meeting.agenda && (
                <p><strong>Agenda:</strong> {meeting.agenda}</p>
              )}
              {meeting.meeting_notes && (
                <p><strong>Notes:</strong> {meeting.meeting_notes}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("myMeetings")}
                className={`${
                  activeTab === "myMeetings"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Meetings
              </button>
              <button
                onClick={() => setActiveTab("createMeeting")}
                className={`${
                  activeTab === "createMeeting"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Meeting
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "myMeetings" ? (
          renderMyMeetings()
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
              <input
                type="text"
                name="meeting_title"
                value={formData.meeting_title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer Name</label>
              <input
                type="text"
                name="organizer_name"
                value={formData.organizer_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Date</label>
              <input
                type="date"
                name="meeting_date"
                value={formData.meeting_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Agenda</label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Notes</label>
              <textarea
                name="meeting_notes"
                value={formData.meeting_notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create Meeting
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Meeting;
