import React, { useState } from 'react'
import { uploadFile, generateFilePath } from '../../../lib/storage'

const MentorForm = ({ formData, setFormData, onFileUpload }) => {
  const [expertise, setExpertise] = useState([])
  const [newExpertise, setNewExpertise] = useState('')
  const [verificationFiles, setVerificationFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleExpertiseAdd = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      const updatedExpertise = [...expertise, newExpertise.trim()]
      setExpertise(updatedExpertise)
      setFormData({ ...formData, domain_expertise: updatedExpertise })
      setNewExpertise('')
    }
  }

  const handleExpertiseRemove = (expertiseToRemove) => {
    const updatedExpertise = expertise.filter(exp => exp !== expertiseToRemove)
    setExpertise(updatedExpertise)
    setFormData({ ...formData, domain_expertise: updatedExpertise })
  }

  const handleVerificationUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedFiles = []

    try {
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name}: Please upload PDF or image files only`)
          continue
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}: File size must be less than 10MB`)
          continue
        }

        const filePath = generateFilePath('temp', file.name, 'verification')
        const fileUrl = await uploadFile(file, 'documents', filePath)
        uploadedFiles.push({ name: file.name, url: fileUrl, path: filePath })
      }

      const updatedFiles = [...verificationFiles, ...uploadedFiles]
      setVerificationFiles(updatedFiles)
      setFormData({ ...formData, verification_docs: updatedFiles })
      onFileUpload('verification', uploadedFiles.map(f => f.path))
    } catch (error) {
      console.error('Verification upload error:', error)
      alert('Failed to upload verification documents. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeVerificationFile = (index) => {
    const updatedFiles = verificationFiles.filter((_, i) => i !== index)
    setVerificationFiles(updatedFiles)
    setFormData({ ...formData, verification_docs: updatedFiles })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Domain Expertise
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleExpertiseAdd())}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Add expertise area (e.g., Machine Learning, Web Development)"
          />
          <button
            type="button"
            onClick={handleExpertiseAdd}
            className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {expertise.map((exp, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2"
            >
              {exp}
              <button
                type="button"
                onClick={() => handleExpertiseRemove(exp)}
                className="text-cyan-400 hover:text-cyan-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Tell us about your experience and background..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          LinkedIn Profile
        </label>
        <input
          type="url"
          name="linkedin"
          value={formData.linkedin || ''}
          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Availability
        </label>
        <select
          name="availability"
          value={formData.availability || ''}
          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">Select availability</option>
          <option value="part-time">Part-time (5-10 hours/week)</option>
          <option value="full-time">Full-time (20+ hours/week)</option>
          <option value="flexible">Flexible schedule</option>
          <option value="weekends">Weekends only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Verification Documents
        </label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleVerificationUpload}
            className="hidden"
            id="verification-upload"
            disabled={uploading}
          />
          <label
            htmlFor="verification-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-lg mb-2">📋 Upload Verification Documents</div>
            <div className="text-sm text-gray-400">
              Certificates, degrees, work experience proof (PDF or images, max 10MB each)
            </div>
          </label>
          {uploading && (
            <div className="mt-2 text-cyan-400">Uploading...</div>
          )}
        </div>
        
        {verificationFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-300">Uploaded files:</div>
            {verificationFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <div className="text-green-400 text-sm">✓ {file.name}</div>
                <button
                  type="button"
                  onClick={() => removeVerificationFile(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MentorForm
