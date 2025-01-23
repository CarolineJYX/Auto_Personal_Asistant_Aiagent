import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  fetchMeetings: () => Promise<void>;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching meetings...');
      const response = await axios.get('http://localhost:8000/meetings');
      console.log('Meetings response:', response.data);
      
      if (response.data.success) {
        setMeetings(response.data.meetings);
      } else {
        setError(response.data.error || 'Failed to fetch meetings');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <MeetingsContext.Provider value={{ meetings, loading, error, fetchMeetings }}>
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};
