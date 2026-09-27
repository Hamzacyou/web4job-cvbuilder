import React from 'react'
import './templates.css'

export default function TemplateEssential({ cvData = {}, innerRef }) {
  const {
    firstName = '',
    lastName = '',
    jobTitle = '',
    email = '',
    phone = '',
    location = '',
    photoUrl = null,
    experiences = [],
    education = [],
    projects = [],
    skills = [],
    languages = []
  } = cvData

  return (
    <div className="tpl-paper ud-resume-paper tpl-essential" ref={innerRef}>
      {/* Header */}
      <header className="ess-header">
        <div className="ess-header-left">
          <h1 className="ess-name">{firstName} {lastName}</h1>
          {jobTitle && <div className="ess-title">{jobTitle}</div>}

          <div className="ess-contact-row">
            {email && (
              <span className="ess-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {email}
              </span>
            )}
            {phone && (
              <span className="ess-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {phone}
              </span>
            )}
            {location && (
              <span className="ess-contact-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {location}
              </span>
            )}
          </div>
        </div>

        {photoUrl && (
          <img className="ess-photo" src={photoUrl} alt={`${firstName} ${lastName}`} />
        )}
      </header>

      {/* Decorative Gradient Line */}
      <div className="ess-divider" />

      {/* Two Columns Body */}
      <div className="ess-body">
        {/* Main Column */}
        <div className="ess-main-col">
          {experiences && experiences.length > 0 && (
            <section className="ess-section">
              <h2 className="ess-sec-title">Expérience Professionnelle</h2>
              {experiences.map((exp) => (
                <div key={exp.id} className="ess-item">
                  <div className="ess-item-header">
                    <span className="ess-item-title">{exp.role}</span>
                    <span className="ess-item-dates">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="ess-item-sub">{exp.company}</div>
                  {exp.description && <p className="ess-item-desc">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {education && education.length > 0 && (
            <section className="ess-section">
              <h2 className="ess-sec-title">Formation & Diplômes</h2>
              {education.map((edu) => (
                <div key={edu.id} className="ess-item">
                  <div className="ess-item-header">
                    <span className="ess-item-title">{edu.degree}</span>
                    <span className="ess-item-dates">{edu.years}</span>
                  </div>
                  <div className="ess-item-sub">{edu.school}</div>
                </div>
              ))}
            </section>
          )}

          {projects && projects.length > 0 && (
            <section className="ess-section">
              <h2 className="ess-sec-title">Projets Réalisés</h2>
              {projects.map((proj) => (
                <div key={proj.id} className="ess-item">
                  <div className="ess-item-header">
                    <span className="ess-item-title">{proj.name}</span>
                    {proj.dates && <span className="ess-item-dates">{proj.dates}</span>}
                  </div>
                  {(proj.role || proj.link) && (
                    <div className="ess-item-sub">
                      {proj.role && <span>{proj.role}</span>}
                      {proj.role && proj.link && <span> • </span>}
                      {proj.link && (
                        <span style={{ color: '#6366f1' }}>
                          {proj.link.replace(/^https?:\/\//i, '')}
                        </span>
                      )}
                    </div>
                  )}
                  {proj.description && <p className="ess-item-desc">{proj.description}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="ess-side-col">
          {skills && skills.length > 0 && (
            <section className="ess-section">
              <h2 className="ess-sec-title">Compétences</h2>
              <div className="ess-skills-wrap">
                {skills.map((skill, idx) => (
                  <span key={idx} className="ess-skill-chip">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {languages && languages.length > 0 && (
            <section className="ess-section">
              <h2 className="ess-sec-title">Langues</h2>
              {languages.map((lang) => (
                <div key={lang.id} className="ess-lang-item">
                  <span className="ess-lang-name">{lang.name}</span>
                  <span className="ess-lang-level">{lang.level}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
