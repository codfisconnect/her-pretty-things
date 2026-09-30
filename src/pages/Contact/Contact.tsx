import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, CheckCircle2 } from 'lucide-react';
import './Contact.css';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.message) {
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1 className="contact-title">Contact The YUSRAA Atelier</h1>
        <p className="contact-sub">
          Have an inquiry about fabric weights, bespoke color recommendations, or an existing
          order? Our dedicated styling concierge is at your service.
        </p>
      </div>

      <div className="contact-grid">
        {/* Info Left */}
        <div className="contact-info-card">
          <h2 className="contact-card-heading">Concierge Assistance</h2>

          <div className="contact-detail-row">
            <div className="contact-icon-bubble">
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Email Inquiries</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>concierge@yusraahijabs.com</div>
              <div style={{ fontSize: '0.78rem', color: '#888' }}>Response within 12 hours</div>
            </div>
          </div>

          <div className="contact-detail-row">
            <div className="contact-icon-bubble">
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Direct Line / WhatsApp</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>+91 98200 12345</div>
              <div style={{ fontSize: '0.78rem', color: '#888' }}>Mon–Sat, 10:00 AM – 7:00 PM IST</div>
            </div>
          </div>

          <div className="contact-detail-row">
            <div className="contact-icon-bubble">
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Atelier Hours</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                Monday to Saturday: 10:00 AM – 7:00 PM<br />
                Sunday: Closed for Atelier curation
              </div>
            </div>
          </div>
        </div>

        {/* Form Right */}
        <div className="contact-form-card">
          <h2 className="contact-card-heading">Send Us a Message</h2>

          {sent && (
            <div className="contact-success-msg" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={20} />
              <span>Thank you. Your message has been received by our concierge team.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-field-group">
              <label className="form-label" htmlFor="contact-name">
                Your Name *
              </label>
              <input
                type="text"
                id="contact-name"
                required
                className="form-input"
                placeholder="Amina Qureshi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="contact-email">
                Email Address *
              </label>
              <input
                type="email"
                id="contact-email"
                required
                className="form-input"
                placeholder="amina@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="contact-subject">
                Subject
              </label>
              <input
                type="text"
                id="contact-subject"
                className="form-input"
                placeholder="Fabric inquiry, bridal styling, order query"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="contact-msg">
                Message *
              </label>
              <textarea
                id="contact-msg"
                required
                className="form-input contact-textarea"
                placeholder="How may our modest wear atelier assist you today?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button type="submit" className="contact-submit-btn">
              <Send size={16} />
              <span>Dispatch Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
