import React, { useState } from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    message: '',
    interest: 'hiring'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  const contactOptions = [
    {
      title: 'Hire Talent',
      description: 'Connect with top developers and build your dream team',
      icon: '👥',
      features: ['Access to verified profiles', 'Direct messaging', 'Portfolio reviews']
    },
    {
      title: 'Partnership',
      description: 'Collaborate with us to enhance your recruitment process',
      icon: '🤝',
      features: ['Custom talent pipelines', 'Bulk hiring solutions', 'Dedicated support']
    },
    {
      title: 'Sponsor Events',
      description: 'Support student events and hackathons',
      icon: '🎯',
      features: ['Brand visibility', 'Direct student engagement', 'Talent pipeline building']
    }
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
          <p className="text-gray-300 mb-6">
            We've received your message and will get back to you within 24 hours.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200"
          >
            Send Another Message
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
        <p className="text-gray-300">Get in touch to discuss opportunities and partnerships</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">How can we help?</h2>
          {contactOptions.map((option, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{option.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-300 mb-3">{option.description}</p>
                  <ul className="space-y-1">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-400 flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Contact Form */}
        <div>
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tech Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="HR Manager"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interest
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="hiring">Hiring Talent</option>
                  <option value="partnership">Partnership</option>
                  <option value="sponsorship">Event Sponsorship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Contact;
