import React, { useState } from 'react'
import { uploadFile, generateResumePath, getPublicUrl } from '../../../lib/storage'

const StudentForm = ({ formData, setFormData, onFileUpload }) => {
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSkillAdd = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()]
      setSkills(updatedSkills)
      setFormData({ ...formData, skills: updatedSkills })
      setNewSkill('')
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove)
    setSkills(updatedSkills)
    setFormData({ ...formData, skills: updatedSkills })
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setResumeFile(file)
    setUploading(true)

    try {
      // Generate path for resume upload (will be updated with actual user ID after registration)
      const tempUserId = 'temp'
      const filePath = generateResumePath(tempUserId, file.name)
      
      // Upload to resumes bucket
      const storagePath = await uploadFile('resumes', filePath, file)
      
      // Get public URL
      const publicUrl = getPublicUrl('resumes', storagePath)
      
      setFormData({ ...formData, resume_url: publicUrl })
      onFileUpload('resume', storagePath)
    } catch (error) {
      console.error('Resume upload error:', error)
      alert('Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            College/University
          </label>
          <input
            type="text"
            name="college"
            value={formData.college || ''}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="MIT, Stanford, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Batch/Year
          </label>
          <input
            type="text"
            name="batch"
            value={formData.batch || ''}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="2024, 2025, etc."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          CGPA
        </label>
        <input
          type="number"
          name="cgpa"
          value={formData.cgpa || ''}
          onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
          min="0"
          max="10"
          step="0.01"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="8.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skills
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Add a skill (e.g., React, Python)"
          />
          <button
            type="button"
            onClick={handleSkillAdd}
            className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
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
          Resume Upload
        </label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
            disabled={uploading}
          />
          <label
            htmlFor="resume-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {resumeFile ? (
              <div className="text-green-400">
                <div className="text-lg mb-2">✓ Resume uploaded</div>
                <div className="text-sm text-gray-400">{resumeFile.name}</div>
              </div>
            ) : (
              <div>
                <div className="text-lg mb-2">📄 Upload Resume</div>
                <div className="text-sm text-gray-400">
                  PDF or Word document (max 5MB)
                </div>
              </div>
            )}
          </label>
          {uploading && (
            <div className="mt-2 text-cyan-400">Uploading...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentForm
