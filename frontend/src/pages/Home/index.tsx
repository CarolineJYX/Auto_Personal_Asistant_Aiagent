import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMeetings } from '@/context/MeetingsContext'
import { useApp } from '@/context/AppContext'
import './home.scss'

const Home = () => {
  const navigate = useNavigate()
  const { meetings } = useMeetings()
  const { emails, tasks, reports } = useApp()
  const [stats, setStats] = useState({
    meetings: 0,
    emails: 0,
    tasks: 0,
    reports: 0
  })

  useEffect(() => {
    setStats({
      meetings: meetings.length,
      emails: emails.length,
      tasks: tasks.length,
      reports: reports.length
    })
  }, [meetings, emails, tasks, reports])

  const quickActions = [
    { name: 'Schedule Meeting', path: '/meeting', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Compose Email', path: '/email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Create Task', path: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Generate Report', path: '/report', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ]

  return (
    <div className="animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, Mira! 👋</h1>
        <p className="mt-2 text-gray-600">Here's what's happening with your personal assistant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Meetings Card */}
        <div 
          onClick={() => navigate('/meeting')}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings Today</p>
              <p className="text-lg font-semibold text-gray-900">{stats.meetings}</p>
            </div>
          </div>
        </div>

        {/* Emails Card */}
        <div 
          onClick={() => navigate('/email')}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread Emails</p>
              <p className="text-lg font-semibold text-gray-900">{stats.emails}</p>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div 
          onClick={() => navigate('/tasks')}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{stats.tasks}</p>
            </div>
          </div>
        </div>

        {/* Reports Card */}
        <div 
          onClick={() => navigate('/report')}
          className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-lg font-semibold text-gray-900">{stats.reports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-sm transition-all"
            >
              <div className="p-2 rounded-full bg-purple-50">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                </svg>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-600">Complete your profile</p>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-600">Connect your calendar</p>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
            </div>
            <p className="ml-3 text-sm text-gray-600">Set up email notifications</p>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
            </div>
            <p className="ml-3 text-sm text-gray-600">Create your first task</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
