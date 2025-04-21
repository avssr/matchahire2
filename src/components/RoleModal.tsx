import React from 'react';
import { X, MapPin, Building2, DollarSign } from 'lucide-react';

interface RoleModalProps {
  role: {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
    location: string;
    salary: string;
    companyDescription?: string;
    companyLogo?: string;
  };
  onClose: () => void;
  onApply?: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ role, onClose, onApply }) => {
  const handleApply = () => {
    if (onApply) {
      onApply();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-50 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header with gradient background */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-teal-50 border-b">
          <div className="flex items-center">
            {role.companyLogo && (
              <img 
                src={role.companyLogo} 
                alt={`${role.company} logo`}
                className="w-10 h-10 mr-3 rounded-full object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{role.title}</h2>
              <div className="flex items-center text-gray-600 mt-1">
                <Building2 size={16} className="mr-1" />
                <p>{role.company}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-white/80 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key details section */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MapPin size={18} className="mr-2 text-gray-500" />
              <span className="text-gray-700">{role.location}</span>
            </div>
            <div className="flex items-center">
              <DollarSign size={18} className="mr-2 text-gray-500" />
              <span className="text-gray-700">{role.salary}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{role.description}</p>
          </div>

          {role.companyDescription && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">About the Company</h3>
              <p className="text-gray-700">{role.companyDescription}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Requirements</h3>
            <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
              {role.requirements.map((req, index) => (
                <li key={index} className="pl-2">{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Skills & Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {role.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-lg hover:from-green-700 hover:to-teal-600 transition-colors shadow-sm font-medium"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal; 