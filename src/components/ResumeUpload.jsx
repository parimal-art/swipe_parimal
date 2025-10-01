import { useState } from 'react';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import { parseResumeText } from '../utils/evaluation';

export default function ResumeUpload({ onComplete, interviewCode }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt'].includes(extension)) {
      setError('Please upload a PDF or TXT file');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const parseFile = async () => {
    if (!file) return;

    setParsing(true);
    setError('');

    try {
      const text = await file.text();
      const parsed = parseResumeText(text);

      setParsedData(parsed);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
      });

      if (!parsed.name || !parsed.email || !parsed.phone) {
        setManualEntry(true);
      }
    } catch (err) {
      setError('Failed to parse resume. Please enter your details manually.');
      setManualEntry(true);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Upload Your Resume
          </h2>
          <p className="text-slate-600 mb-6">
            Interview Code: <span className="font-mono font-semibold">{interviewCode}</span>
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!file && (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  Click to upload your resume
                </p>
                <p className="text-sm text-slate-500">
                  PDF or TXT (max 5MB)
                </p>
              </label>
            </div>
          )}

          {file && !parsedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={parseFile}
                  disabled={parsing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {parsing ? 'Parsing...' : 'Parse Resume'}
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>
          )}

          {(parsedData || manualEntry) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {parsedData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-800">
                    We've extracted your information from the resume. Please verify and correct if needed.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Interview
              </button>
            </form>
          )}

          {!file && !manualEntry && (
            <button
              onClick={() => setManualEntry(true)}
              className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Skip resume upload and enter details manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
