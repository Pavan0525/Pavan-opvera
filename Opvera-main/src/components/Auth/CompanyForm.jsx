import React, { useState } from 'react'
import { uploadFile, generateFilePath } from '../../../lib/storage'

const CompanyForm = ({ formData, setFormData, onFileUpload }) => {
  const [logoFile, setLogoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or SVG)')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be less than 2MB')
      return
    }

    setLogoFile(file)
    setUploading(true)

    try {
      const filePath = generateFilePath('temp', file.name, 'logo')
      const logoUrl = await uploadFile(file, 'images', filePath)
      setFormData({ ...formData, logo_url: logoUrl })
      onFileUpload('logo', filePath)
    } catch (error) {
      console.error('Logo upload error:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName || ''}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Acme Corporation"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Size
        </label>
        <select
          name="companySize"
          value={formData.companySize || ''}
          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">Select company size</option>
          <option value="startup">Startup (1-10 employees)</option>
          <option value="small">Small (11-50 employees)</option>
          <option value="medium">Medium (51-200 employees)</option>
          <option value="large">Large (201-1000 employees)</option>
          <option value="enterprise">Enterprise (1000+ employees)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Tell us about your company, mission, and what you do..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contact Person Name
        </label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson || ''}
          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contact Person Title
        </label>
        <input
          type="text"
          name="contactTitle"
          value={formData.contactTitle || ''}
          onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="HR Manager, Talent Acquisition Lead, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="https://www.yourcompany.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Logo
        </label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="logo-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {logoFile ? (
              <div className="text-green-400">
                <div className="text-lg mb-2">✓ Logo uploaded</div>
                <div className="text-sm text-gray-400">{logoFile.name}</div>
                {logoFile.type.startsWith('image/') && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo preview"
                      className="max-w-32 max-h-32 mx-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-lg mb-2">🏢 Upload Company Logo</div>
                <div className="text-sm text-gray-400">
                  JPEG, PNG, GIF, or SVG (max 2MB)
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

export default CompanyForm
