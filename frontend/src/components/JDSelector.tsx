'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Check, ChevronDown, ChevronUp, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface JDSelectorProps {
  onSelect: (job: Job) => void;
  selectedJobId?: string;
}

export default function JDSelector({ onSelect, selectedJobId }: JDSelectorProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analysis/jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div 
        className="p-4 bg-gradient-to-r from-indigo-500 to-violet-500 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Briefcase size={20} />
            <h2 className="font-semibold text-lg">Select Job Description</h2>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase size={48} className="mx-auto mb-2 opacity-50" />
              <p>No jobs found</p>
              <p className="text-sm">Create a job first to analyze resumes</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredJobs.map(job => (
                  <div
                    key={job._id}
                    onClick={() => onSelect(job)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedJobId === job._id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{job.title}</h3>
                          {selectedJobId === job._id && <Check size={16} className="text-indigo-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(job.createdAt).toLocaleDateString()} • 
                          <span className={`ml-1 ${
                            job.status === 'active' ? 'text-green-600' :
                            job.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {job.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectedJob && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Selected Job</p>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedJob.title}</p>
        </div>
      )}
    </div>
  );
}