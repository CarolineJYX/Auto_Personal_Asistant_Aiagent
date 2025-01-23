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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Meetings</h1>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("myMeetings")}
            className={`px-4 py-2 ${
              activeTab === "myMeetings" ? "text-purple-600 font-bold" : "text-gray-600"
            }`}
          >
            My Meetings
          </button>
          <button
            onClick={() => setActiveTab("createMeeting")}
            className={`px-4 py-2 ${
              activeTab === "createMeeting" ? "text-purple-600 font-bold" : "text-gray-600"
            }`}
          >
            Create Meeting
          </button>
        </div>

        {activeTab === "myMeetings" ? (
          <div className="space-y-4">
            {loading && <div>Loading meetings...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && (!meetings || meetings.length === 0) && (
              <div>No meetings found.</div>
            )}
            {!loading && !error && meetings && meetings.length > 0 && (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4">{meeting.meeting_title}</h2>
                    <div className="space-y-2">
                      <p>Organizer: {meeting.organizer_name}</p>
                      <p>Date: {meeting.meeting_date}</p>
                      <p>Time: {meeting.start_time} - {meeting.end_time}</p>
                      <p>Location: {meeting.location}</p>
                      {meeting.agenda && (
                        <div>
                          <p className="font-semibold mt-4">Agenda:</p>
                          <p className="whitespace-pre-wrap">{meeting.agenda}</p>
                        </div>
                      )}
                      {meeting.meeting_notes && (
                        <div>
                          <p className="font-semibold mt-4">Meeting Notes:</p>
                          <p className="whitespace-pre-wrap">{meeting.meeting_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
