import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/UI/GlassCard';
import Navbar from '../../components/UI/Navbar';
import RoleSelector from '../../components/UI/RoleSelector';
import StudentForm from '../../components/Auth/StudentForm';
import MentorForm from '../../components/Auth/MentorForm';
import CompanyForm from '../../components/Auth/CompanyForm';
import { supabase } from '../../lib/supabaseClient';
import { createAuditLog } from '../../lib/audit';
import { deleteFile } from '../../lib/storage';
import { validateRegistrationForm } from '../../lib/validation';
import { useToast } from '../../components/UI/ToastProvider';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    // Student fields
    college: '',
    batch: '',
    cgpa: '',
    skills: [],
    resume_url: '',
    // Mentor fields
    domain_expertise: [],
    bio: '',
    linkedin: '',
    availability: '',
    verification_docs: [],
    // Company fields
    companyName: '',
    companySize: '',
    description: '',
    contactPerson: '',
    contactTitle: '',
    website: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
    setErrors({});
  };

  const handleFileUpload = (type, filePaths) => {
    setUploadedFiles(prev => [...prev, { type, paths: Array.isArray(filePaths) ? filePaths : [filePaths] }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form data
    const validation = validateRegistrationForm(formData, formData.role);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    const sanitizedData = validation.sanitizedData;

    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          data: {
            role: formData.role,
            first_name: sanitizedData.firstName,
            last_name: sanitizedData.lastName
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Prepare profile data based on role
      let profileData = {
        id: authData.user.id,
        username: `${sanitizedData.firstName} ${sanitizedData.lastName}`,
        email: sanitizedData.email,
        role: formData.role,
        level: 'beginner',
        total_score: 0
      };

      // Add role-specific fields
      if (formData.role === 'student') {
        profileData = {
          ...profileData,
          college: sanitizedData.college,
          batch: sanitizedData.batch,
          cgpa: sanitizedData.cgpa,
          skills: sanitizedData.skills,
          resume_url: formData.resume_url
        };
      } else if (formData.role === 'mentor') {
        profileData = {
          ...profileData,
          domain_expertise: sanitizedData.domain_expertise,
          bio: sanitizedData.bio,
          linkedin: sanitizedData.linkedin,
          availability: sanitizedData.availability,
          verification_docs: formData.verification_docs,
          verified: false // Mentors need verification
        };
      } else if (formData.role === 'company') {
        profileData = {
          ...profileData,
          company_name: sanitizedData.companyName,
          company_size: formData.companySize,
          description: sanitizedData.description,
          contact_person: sanitizedData.contactPerson,
          contact_title: sanitizedData.contactTitle,
          website: sanitizedData.website,
          logo_url: formData.logo_url,
          verified: false // Companies need verification
        };
      }

      // Create profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Move uploaded files to permanent location
      if (uploadedFiles.length > 0) {
        for (const upload of uploadedFiles) {
          for (const path of upload.paths) {
            const newPath = path.replace('temp', authData.user.id);
            try {
              // Determine bucket based on upload type
              let bucket = 'resumes';
              if (upload.type === 'logo') {
                bucket = 'avatars';
              } else if (upload.type === 'verification') {
                bucket = 'documents';
              }
              
              // Move file from temp to permanent location
              const { error: moveError } = await supabase.storage
                .from(bucket)
                .move(path, newPath);

              if (moveError) {
                console.warn(`Failed to move file ${path}:`, moveError);
              }
            } catch (moveError) {
              console.warn(`Failed to move file ${path}:`, moveError);
            }
          }
        }
      }

      // Create audit log for verification if needed
      if (formData.role === 'mentor' || formData.role === 'company') {
        await createAuditLog(
          'registration_verification_required',
          formData.role,
          authData.user.id,
          {
            email: formData.email,
            role: formData.role,
            verification_docs: formData.verification_docs || [],
            company_name: formData.companyName || null
          }
        );
      }

      success('Account created successfully! Please check your email to verify your account.');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      error(err.message || 'Registration failed');
      
      // Clean up uploaded files on error
      if (uploadedFiles.length > 0) {
        for (const upload of uploadedFiles) {
          for (const path of upload.paths) {
            try {
              // Determine bucket based on upload type
              let bucket = 'resumes';
              if (upload.type === 'logo') {
                bucket = 'avatars';
              } else if (upload.type === 'verification') {
                bucket = 'documents';
              }
              
              await deleteFile(bucket, path);
            } catch (deleteError) {
              console.warn('Failed to cleanup file:', deleteError);
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
              <p className="text-gray-300">Create your account to join Opvera</p>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                <div className="font-medium mb-2">Please fix the following errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <RoleSelector
                selectedRole={formData.role}
                onRoleChange={handleRoleChange}
              />

              {/* Basic Information */}
              {formData.role && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Role-specific forms */}
                  {formData.role === 'student' && (
                    <StudentForm
                      formData={formData}
                      setFormData={setFormData}
                      onFileUpload={handleFileUpload}
                    />
                  )}

                  {formData.role === 'mentor' && (
                    <MentorForm
                      formData={formData}
                      setFormData={setFormData}
                      onFileUpload={handleFileUpload}
                    />
                  )}

                  {formData.role === 'company' && (
                    <CompanyForm
                      formData={formData}
                      setFormData={setFormData}
                      onFileUpload={handleFileUpload}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </>
              )}
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Login
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Register;
