import React from 'react'
import './templates.css'

export default function TemplateElegant({ cvData = {}, innerRef }) {
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
    <div className="tpl-paper ud-resume-paper tpl-elegant" ref={innerRef}>
      {/* Header */}
      <header className="elg-header">
        <div>
          <h1 className="elg-name">{firstName} {lastName}</h1>
          {jobTitle && <div className="elg-title">{jobTitle}</div>}

          <div className="elg-contacts">
            {email && <span>{email}</span>}
            {phone && <span>✦ {phone}</span>}
            {location && <span>✦ {location}</span>}
          </div>
        </div>

        {photoUrl && (
          <img className="elg-avatar" src={photoUrl} alt={`${firstName} ${lastName}`} />
        )}
      </header>

      {/* Body */}
      <div className="elg-body">
        {/* Main Column */}
        <div>
          {experiences && experiences.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="elg-sec-title">Expériences Notables</h2>
              {experiences.map((exp) => (
                <div key={exp.id} className="elg-item">
                  <div className="elg-item-header">
                    <span className="elg-item-title">{exp.role}</span>
                    <span className="elg-item-dates">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <div className="elg-item-sub">{exp.company}</div>
                  {exp.description && <p className="elg-item-desc">{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {education && education.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="elg-sec-title">Formation Supérieure</h2>
              {education.map((edu) => (
                <div key={edu.id} className="elg-item">
                  <div className="elg-item-header">
                    <span className="elg-item-title">{edu.degree}</span>
                    <span className="elg-item-dates">{edu.years}</span>
                  </div>
                  <div className="elg-item-sub">{edu.school}</div>
                </div>
              ))}
            </section>
          )}

          {projects && projects.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 className="elg-sec-title">Projets d'Envergure</h2>
              {projects.map((proj) => (
                <div key={proj.id} className="elg-item">
                  <div className="elg-item-header">
                    <span className="elg-item-title">{proj.name}</span>
                    {proj.dates && <span className="elg-item-dates">{proj.dates}</span>}
                  </div>
                  {(proj.role || proj.link) && (
                    <div className="elg-item-sub">
                      {proj.role && <span>{proj.role}</span>}
                      {proj.role && proj.link && <span> • </span>}
                      {proj.link && <span style={{ color: '#b45309' }}>{proj.link.replace(/^https?:\/\//i, '')}</span>}
                    </div>
                  )}
                  {proj.description && <p className="elg-item-desc">{proj.description}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Side Column */}
        <div>
          {skills && skills.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="elg-sec-title">Expertises</h2>
              <div>
                {skills.map((skill, idx) => (
                  <span key={idx} className="elg-skill-chip">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {languages && languages.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 className="elg-sec-title">Langues</h2>
              <div>
                {languages.map((lang) => (
                  <div key={lang.id} className="elg-lang-item">
                    <span style={{ fontWeight: 600, color: '#44403c' }}>{lang.name}</span>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>{lang.level}</span>
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
