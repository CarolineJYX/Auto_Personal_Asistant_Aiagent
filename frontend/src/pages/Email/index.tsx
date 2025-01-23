import React, { useState } from "react";
import axios from 'axios';

interface Contact {
  id: number;
  name: string;
  email: string;
  category: string;
  avatar: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
}

type Tab = 'send' | 'summary';

const Email = () => {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [showAskAi, setShowAskAi] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Mock email templates
  const templates: EmailTemplate[] = [
    {
      id: 1,
      name: "Meeting Invitation",
      subject: "Invitation: Team Meeting",
      content: "Dear {recipientName},\n\nI hope this email finds you well. I would like to invite you to a team meeting scheduled for [DATE] at [TIME]. We will be discussing [TOPIC].\n\nBest regards,\n[Your name]"
    },
    {
      id: 2,
      name: "Project Update",
      subject: "Project Update: Q1 Progress",
      content: "Hi {recipientName},\n\nI wanted to provide you with an update on our project progress. [PROJECT_DETAILS]\n\nBest,\n[Your name]"
    },
    {
      id: 3,
      name: "Thank You Note",
      subject: "Thank You for Your Support",
      content: "Dear {recipientName},\n\nI wanted to express my sincere thanks for [OCCASION]. Your support means a lot.\n\nBest wishes,\n[Your name]"
    }
  ];

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: 1,
      name: "Mira Wang",
      email: "mirawang@u.nus.edu",
      category: "University",
      avatar: "https://ui-avatars.com/api/?name=Mira+Wang&background=6366f1&color=fff"
    },
    {
      id: 2,
      name: "John Smith",
      email: "john.smith@example.com",
      category: "Work",
      avatar: "https://ui-avatars.com/api/?name=John+Smith&background=6366f1&color=fff"
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      category: "Client",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff"
    },
    {
      id: 4,
      name: "Michael Chen",
      email: "m.chen@partner.com",
      category: "Partners",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen"
    },
    {
      id: 5,
      name: "Emma Davis",
      email: "emma.d@client.com",
      category: "Clients",
      avatar: "https://ui-avatars.com/api/?name=Emma+Davis"
    },
    {
      id: 6,
      name: "Alex Kim",
      email: "alex.kim@company.com",
      category: "Work",
      avatar: "https://ui-avatars.com/api/?name=Alex+Kim"
    }
  ];

  // Generate email content based on selections
  const generateEmailContent = (template: EmailTemplate, contact: Contact) => {
    let content = template.content;
    content = content.replace('{recipientName}', contact.name);
    
    // Add default values for common placeholders
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateStr = tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = "10:00 AM";

    content = content.replace('[DATE]', dateStr);
    content = content.replace('[TIME]', timeStr);
    content = content.replace('[TOPIC]', 'upcoming project milestones and team objectives');
    content = content.replace('[PROJECT_DETAILS]', 'We have completed 75% of our planned objectives and are on track for delivery.');
    content = content.replace('[OCCASION]', 'your valuable contribution to the project');
    content = content.replace('[Your name]', 'AI Assistant');

    return content;
  };

  const handleSelectionChange = () => {
    if (selectedTemplate && selectedContact) {
      const content = generateEmailContent(selectedTemplate, selectedContact);
      setAiMessage(content);
      setShowAskAi(true);
    }
  };

  // Effect to handle selection changes
  React.useEffect(() => {
    handleSelectionChange();
  }, [selectedTemplate, selectedContact]);

  const handleAiSubmit = async () => {
    if (!selectedContact || !selectedTemplate) {
      alert('Please select both a contact and a template first.');
      return;
    }

    setIsSending(true);
    setSendStatus('sending');

    try {
      const emailContent = aiMessage || selectedTemplate.content;
      const requestData = {
        type: 'email',
        to: selectedContact.email,
        subject: selectedTemplate.subject,
        content: emailContent
      };
      
      console.log('Sending request:', requestData);

      const response = await axios.post('http://localhost:5000/proxy-webhook', requestData);

      console.log('Response:', response.data);

      if (response.status === 200) {
        setSendStatus('success');
        setShowAskAi(false);
        setUserQuestion('');
        alert('Email sent successfully!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      setSendStatus('error');
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAskAI = async () => {
    if (!userQuestion.trim()) {
      return;
    }

    setIsSending(true);
    setSendStatus('sending');

    try {
      const response = await axios.post('http://localhost:8000/ai/message', {
        message: userQuestion,
        template: selectedTemplate?.content || '',
        contact: selectedContact ? {
          name: selectedContact.name,
          email: selectedContact.email
        } : null
      });

      if (response.data.success) {
        setAiResponse(response.data.response?.message || 'Email request processed successfully');
        setSendStatus('success');
      } else {
        setAiResponse(response.data.error || 'Failed to process email request');
        setSendStatus('error');
      }
    } catch (error: any) {
      console.error('Error asking AI:', error);
      setAiResponse(error.response?.data?.error || 'Failed to connect to the email service');
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const renderSendTab = () => (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Email Template</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          onChange={(e) => setSelectedTemplate(templates.find(t => t.id === parseInt(e.target.value)) || null)}
        >
          <option value="">Choose a template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
      </div>

      {/* Ask AI Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask AI to Help Write Your Email
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            rows={4}
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Describe what you want to say in the email..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            className={`px-4 py-2 rounded-md text-white ${
              isSending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            onClick={handleAskAI}
            disabled={isSending || !userQuestion.trim()}
          >
            {isSending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Ask AI to Generate Email'
            )}
          </button>
        </div>

        {/* AI Response Display */}
        {aiResponse && (
          <div className={`mt-4 p-4 rounded-md ${
            sendStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <p className="whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Update the button text based on status
  const getButtonText = () => {
    if (activeTab === 'summary') return 'Ask AI to Generate Summary';
    if (isSending) return 'Sending...';
    if (sendStatus === 'success') return 'Email Sent!';
    return 'Ask AI to Send Email';
  };

  // Update the button styles based on status
  const getButtonStyles = () => {
    if (isSending) return 'bg-purple-400 cursor-not-allowed';
    if (sendStatus === 'success') return 'bg-green-600 hover:bg-green-700';
    if (sendStatus === 'error') return 'bg-red-600 hover:bg-red-700';
    return 'bg-purple-600 hover:bg-purple-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('send')}
              className={`${
                activeTab === 'send'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Send Email
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`${
                activeTab === 'summary'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Custom Prompt
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'send' ? (
        renderSendTab()
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Prompt
                </label>
                <textarea
                  rows={4}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <button
                onClick={async () => {
                  if (!userQuestion.trim()) {
                    alert('Please enter a prompt');
                    return;
                  }

                  setIsSending(true);
                  try {
                    console.log('Sending custom prompt:', userQuestion);
                    const response = await axios.post('http://localhost:5002/proxy-webhook', {
                      prompt: userQuestion,
                      action: 'custom_prompt'
                    });

                    console.log('Response:', response.data);
                    alert('Prompt sent successfully!');
                    setUserQuestion('');
                  } catch (error) {
                    console.error('Error sending prompt:', error);
                    alert('Failed to send prompt. Please try again.');
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending || !userQuestion.trim()}
                className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSending || !userQuestion.trim()
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {isSending ? 'Sending...' : 'Send Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
