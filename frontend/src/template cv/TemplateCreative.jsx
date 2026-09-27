import React from 'react'
import './templates.css'

export default function TemplateCreative({ cvData = {}, innerRef }) {
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
    <div className="tpl-paper ud-resume-paper tpl-creative" ref={innerRef}>
      {/* Banner */}
      <header className="crt-banner">
        <div className="crt-banner-inner">
          <div>
            <h1 className="crt-name">{firstName} {lastName}</h1>
            {jobTitle && <div className="crt-title">{jobTitle}</div>}

            <div className="crt-header-contacts">
              {email && (
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {email}
                </span>
              )}
              {phone && (
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {phone}
                </span>
              )}
              {location && (
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                </span>
              )}
            </div>
          </div>

          {photoUrl && (
            <img className="crt-avatar" src={photoUrl} alt={`${firstName} ${lastName}`} />
          )}
        </div>
      </header>

      {/* Body */}
      <div className="crt-body">
        {/* Left Col */}
        <div className="crt-main-col">
          {experiences && experiences.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="crt-sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Expériences Clés
              </h2>
              {experiences.map((exp) => (
                <div key={exp.id} className="crt-card">
                  <div className="crt-card-top">
                    <span className="crt-card-role">{exp.role}</span>
                    <span className="crt-card-dates">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="crt-card-comp">{exp.company}</div>
                  {exp.description && <p className="crt-card-desc">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {education && education.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="crt-sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Formations
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="crt-card" style={{ borderLeftColor: '#7c3aed' }}>
                  <div className="crt-card-top">
                    <span className="crt-card-role">{edu.degree}</span>
                    <span className="crt-card-dates">{edu.years}</span>
                  </div>
                  <div className="crt-card-comp">{edu.school}</div>
                </div>
              ))}
            </section>
          )}

          {projects && projects.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="crt-sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                Projets & Portfolios
              </h2>
              {projects.map((proj) => (
                <div key={proj.id} className="crt-card" style={{ borderLeftColor: '#06b6d4' }}>
                  <div className="crt-card-top">
                    <span className="crt-card-role">{proj.name}</span>
                    {proj.dates && <span className="crt-card-dates" style={{ color: '#0891b2' }}>{proj.dates}</span>}
                  </div>
                  {(proj.role || proj.link) && (
                    <div className="crt-card-comp">
                      {proj.role && <span>{proj.role}</span>}
                      {proj.role && proj.link && <span> • </span>}
                      {proj.link && <span style={{ color: '#7c3aed' }}>{proj.link.replace(/^https?:\/\//i, '')}</span>}
                    </div>
                  )}
                  {proj.description && <p className="crt-card-desc">{proj.description}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Col */}
        <div className="crt-side-col">
          {skills && skills.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="crt-sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Compétences
              </h2>
              <div>
                {skills.map((skill, idx) => (
                  <span key={idx} className="crt-skill-badge">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {languages && languages.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="crt-sec-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Langues
              </h2>
              <div>
                {languages.map((lang) => (
                  <div key={lang.id} className="crt-lang-pill">
                    <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{lang.name}</span>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>{lang.level}</span>
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
