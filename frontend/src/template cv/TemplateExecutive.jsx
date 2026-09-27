import React from 'react'
import './templates.css'

export default function TemplateExecutive({ cvData = {}, innerRef }) {
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
    <div className="tpl-paper ud-resume-paper tpl-executive" ref={innerRef}>
      {/* Left Navy Sidebar */}
      <aside className="exec-sidebar">
        {photoUrl && (
          <div className="exec-avatar-wrap">
            <img className="exec-avatar" src={photoUrl} alt={`${firstName} ${lastName}`} />
          </div>
        )}

        <div className="exec-side-sec">
          <h3 className="exec-side-title">Contact</h3>
          {email && (
            <div className="exec-contact-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="exec-contact-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{phone}</span>
            </div>
          )}
          {location && (
            <div className="exec-contact-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </div>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="exec-side-sec">
            <h3 className="exec-side-title">Expertise</h3>
            {skills.map((skill, idx) => (
              <span key={idx} className="exec-skill-chip">{skill}</span>
            ))}
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="exec-side-sec">
            <h3 className="exec-side-title">Langues</h3>
            {languages.map((lang) => (
              <div key={lang.id} className="exec-lang-row">
                <span>{lang.name}</span>
                <span>{lang.level}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Main Body */}
      <main className="exec-main">
        <h1 className="exec-name">{firstName} {lastName}</h1>
        {jobTitle && <div className="exec-role-title">{jobTitle}</div>}

        {experiences && experiences.length > 0 && (
          <section className="exec-main-sec">
            <h2 className="exec-sec-title">Expériences de Direction & Postes Clés</h2>
            {experiences.map((exp) => (
              <div key={exp.id} className="exec-exp-card">
                <div className="exec-exp-top">
                  <span className="exec-exp-role">{exp.role}</span>
                  <span className="exec-exp-dates">{exp.startDate} — {exp.endDate}</span>
                </div>
                <div className="exec-exp-comp">{exp.company}</div>
                {exp.description && <p className="exec-exp-desc">{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {education && education.length > 0 && (
          <section className="exec-main-sec">
            <h2 className="exec-sec-title">Cursus Académique</h2>
            {education.map((edu) => (
              <div key={edu.id} className="exec-exp-card">
                <div className="exec-exp-top">
                  <span className="exec-exp-role">{edu.degree}</span>
                  <span className="exec-exp-dates">{edu.years}</span>
                </div>
                <div className="exec-exp-comp">{edu.school}</div>
              </div>
            ))}
          </section>
        )}

        {projects && projects.length > 0 && (
          <section className="exec-main-sec">
            <h2 className="exec-sec-title">Projets & Réalisations Clés</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="exec-exp-card">
                <div className="exec-exp-top">
                  <span className="exec-exp-role">{proj.name}</span>
                  {proj.dates && <span className="exec-exp-dates">{proj.dates}</span>}
                </div>
                {(proj.role || proj.link) && (
                  <div className="exec-exp-comp">
                    {proj.role && <span>{proj.role}</span>}
                    {proj.role && proj.link && <span> — </span>}
                    {proj.link && (
                      <span style={{ color: '#0284c7' }}>{proj.link.replace(/^https?:\/\//i, '')}</span>
                    )}
                  </div>
                )}
                {proj.description && <p className="exec-exp-desc">{proj.description}</p>}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
