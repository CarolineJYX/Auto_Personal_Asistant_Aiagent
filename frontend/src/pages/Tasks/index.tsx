import React, { useState, useEffect } from "react";
import Card from '@/components/card';
import axios from 'axios';

interface Task {
  id: number;
  name: string;
  description: string;
  priority: string;
  status: string;
  start_date: string;
  end_date: string;
}

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("myTasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    start_date: '',
    end_date: '',
    task_summary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tasks');
      if (response.data.success) {
        setTasks(response.data.tasks || []);
        setError('');
      } else {
        setError(response.data.error || 'Failed to fetch tasks');
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.error || 'Failed to connect to server. Please try again later.');
      setTasks([]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedTask = {
        ...newTask,
        priority: newTask.priority.toUpperCase(),
        status: newTask.status.toUpperCase().replace(' ', '_')
      };

      const response = await axios.post('http://localhost:8000/tasks/create', formattedTask);
      
      if (response.data.success) {
        setNewTask({
          name: '',
          description: '',
          priority: 'Medium',
          status: 'Not Started',
          start_date: '',
          end_date: '',
          task_summary: ''
        });
        await fetchTasks(); // Refresh the task list
        setActiveTab('myTasks');
      } else {
        setError(response.data.error || 'Failed to create task');
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.error || 'Failed to create task. Please check all fields are filled correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-purple-100">
              <h2 className="px-4 py-3 text-lg font-semibold text-purple-900 border-b border-purple-100">Tasks Menu</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("myTasks")}
                  className={`w-full px-4 py-2 text-left ${
                    activeTab === "myTasks"
                      ? "bg-purple-100 text-purple-900"
                      : "text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => setActiveTab("createTask")}
                  className={`w-full px-4 py-2 text-left ${
                    activeTab === "createTask"
                      ? "bg-purple-100 text-purple-900"
                      : "text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {activeTab === "myTasks" && (
              <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
                <h1 className="text-2xl font-bold text-purple-900 mb-6">My Tasks</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4 hover:bg-purple-100 transition-colors duration-200">
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">{task.name}</h3>
                      <p className="text-purple-600 mb-2">{task.description}</p>
                      <div className="flex justify-between text-sm text-purple-500">
                        <span>Priority: {task.priority}</span>
                        <span>Status: {task.status}</span>
                      </div>
                      <div className="mt-2 text-sm text-purple-500">
                        <p>Start: {new Date(task.start_date).toLocaleDateString()}</p>
                        <p>End: {new Date(task.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "createTask" && (
              <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
                <h1 className="text-2xl font-bold text-purple-900 mb-6">Create Task</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-purple-700 mb-2">Task Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newTask.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={newTask.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-700 mb-1 text-sm">Priority</label>
                      <select
                        name="priority"
                        value={newTask.priority}
                        onChange={handleInputChange}
                        className="w-full p-1.5 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-700 mb-1 text-sm">Status</label>
                      <select
                        name="status"
                        value={newTask.status}
                        onChange={handleInputChange}
                        className="w-full p-1.5 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-700 mb-2">Start Date</label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={newTask.start_date}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-700 mb-2">End Date</label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={newTask.end_date}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("myTasks")}
                      className="px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      {loading ? "Creating..." : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
