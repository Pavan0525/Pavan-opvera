import React, { useState } from 'react';

const RoleSelector = ({ selectedRole, onRoleChange, className = '' }) => {
  const roles = [
    { value: 'student', label: 'Student', icon: '🎓', description: 'Learn and grow' },
    { value: 'mentor', label: 'Mentor', icon: '👨‍🏫', description: 'Guide others' },
    { value: 'company', label: 'Company', icon: '🏢', description: 'Find talent' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Choose your role
      </label>
      <div className="grid grid-cols-1 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedRole === role.value
                ? 'border-cyan-400 bg-cyan-500/20'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{role.icon}</span>
              <div>
                <div className="text-white font-medium">{role.label}</div>
                <div className="text-gray-400 text-sm">{role.description}</div>
              </div>
              {selectedRole === role.value && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
