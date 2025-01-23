import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Email {
  id: number;
  subject: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
}

interface Report {
  id: number;
  title: string;
  date: string;
}

interface AppContextType {
  emails: Email[];
  tasks: Task[];
  reports: Report[];
  loading: {
    emails: boolean;
    tasks: boolean;
    reports: boolean;
  };
  error: {
    emails: string | null;
    tasks: string | null;
    reports: string | null;
  };
  fetchEmails: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchReports: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState({
    emails: false,
    tasks: false,
    reports: false
  });
  const [error, setError] = useState({
    emails: null,
    tasks: null,
    reports: null
  });

  const fetchEmails = async () => {
    setLoading(prev => ({ ...prev, emails: true }));
    setError(prev => ({ ...prev, emails: null }));
    try {
      // Fetch unread count from Gmail API
      const response = await axios.get('http://localhost:8000/email/unread');
      if (response.data.success) {
        setEmails(new Array(response.data.unread_count).fill({})); // Create array of length unread_count
      } else {
        setError(prev => ({ ...prev, emails: response.data.error || 'Failed to fetch emails' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, emails: 'Failed to fetch emails. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, emails: false }));
    }
  };

  const fetchTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    setError(prev => ({ ...prev, tasks: null }));
    try {
      const response = await axios.get('http://localhost:8000/tasks');
      if (response.data.success) {
        setTasks(response.data.tasks);
      } else {
        setError(prev => ({ ...prev, tasks: response.data.error || 'Failed to fetch tasks' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, tasks: 'Failed to fetch tasks. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const fetchReports = async () => {
    setLoading(prev => ({ ...prev, reports: true }));
    setError(prev => ({ ...prev, reports: null }));
    try {
      const response = await axios.get('http://localhost:8000/reports');
      if (response.data.success) {
        setReports(response.data.reports);
      } else {
        setError(prev => ({ ...prev, reports: response.data.error || 'Failed to fetch reports' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, reports: 'Failed to fetch reports. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchTasks();
    fetchReports();
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        emails, 
        tasks, 
        reports, 
        loading, 
        error,
        fetchEmails,
        fetchTasks,
        fetchReports
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
