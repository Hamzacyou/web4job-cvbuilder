import React from 'react'
import './templates.css'

export default function TemplateTech({ cvData = {}, innerRef }) {
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
    <div className="tpl-paper ud-resume-paper tpl-tech" ref={innerRef}>
      {/* Dark Slate Tech Header */}
      <header className="tch-header">
        <div>
          <div className="tch-prompt">$ cat profile.json</div>
          <h1 className="tch-name">&gt; {firstName} {lastName}</h1>
          <div className="tch-title">// {jobTitle || 'Software Engineer'}</div>

          <div className="tch-contacts">
            {email && (
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {email}
              </span>
            )}
            {phone && (
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {phone}
              </span>
            )}
            {location && (
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {location}
              </span>
            )}
          </div>
        </div>

        {photoUrl && (
          <img className="tch-avatar" src={photoUrl} alt={`${firstName} ${lastName}`} />
        )}
      </header>

      {/* Body */}
      <div className="tch-body">
        {/* Main Col: Experiences & Education */}
        <div>
          {experiences && experiences.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="tch-sec-title">01. Parours Professionnel</h2>
              {experiences.map((exp) => (
                <div key={exp.id} className="tch-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="tch-item-role">{exp.role}</span>
                    <span className="tch-item-dates">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="tch-item-comp">@ {exp.company}</div>
                  {exp.description && <p className="tch-item-desc">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {education && education.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="tch-sec-title">02. Formation Technique</h2>
              {education.map((edu) => (
                <div key={edu.id} className="tch-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="tch-item-role">{edu.degree}</span>
                    <span className="tch-item-dates">{edu.years}</span>
                  </div>
                  <div className="tch-item-comp">{edu.school}</div>
                </div>
              ))}
            </section>
          )}

          {projects && projects.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="tch-sec-title">03. Projets &amp; Open-Source</h2>
              {projects.map((proj) => (
                <div key={proj.id} className="tch-item" style={{ borderLeftColor: '#10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="tch-item-role">{proj.name}</span>
                    {proj.dates && <span className="tch-item-dates">{proj.dates}</span>}
                  </div>
                  {(proj.role || proj.link) && (
                    <div className="tch-item-comp" style={{ color: '#059669', fontSize: '11.5px', marginBottom: '4px' }}>
                      {proj.role && <span>{proj.role}</span>}
                      {proj.role && proj.link && <span> // </span>}
                      {proj.link && <span>{proj.link.replace(/^https?:\/\//i, '')}</span>}
                    </div>
                  )}
                  {proj.description && <p className="tch-item-desc">{proj.description}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Side Col: Stack & Languages */}
        <div>
          {skills && skills.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="tch-sec-title">Tech Stack</h2>
              <div>
                {skills.map((skill, idx) => (
                  <span key={idx} className="tch-skill-chip">{`{ ${skill} }`}</span>
                ))}
              </div>
            </section>
          )}

          {languages && languages.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="tch-sec-title">Langues</h2>
              <div>
                {languages.map((lang) => (
                  <div key={lang.id} className="tch-lang-chip">
                    <span style={{ fontWeight: 600, color: '#334155' }}>{lang.name}</span>
                    <span style={{ color: '#0e7490', fontFamily: 'monospace' }}>[{lang.level}]</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
