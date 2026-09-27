import React from 'react'
import './templates.css'

export default function TemplateMinimalist({ cvData = {}, innerRef }) {
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
    <div className="tpl-paper ud-resume-paper tpl-minimalist" ref={innerRef}>
      {/* Minimal Header */}
      <header className="min-header">
        <div>
          <h1 className="min-name">{firstName} {lastName}</h1>
          {jobTitle && <div className="min-title">{jobTitle}</div>}
        </div>

        <div className="min-contacts">
          {email && <span className="min-contacts-item">{email}</span>}
          {phone && <span className="min-contacts-item">{phone}</span>}
          {location && <span className="min-contacts-item">{location}</span>}
        </div>
      </header>

      {/* Experience Section */}
      {experiences && experiences.length > 0 && (
        <section className="min-section">
          <h2 className="min-sec-title">Expérience</h2>
          <div>
            {experiences.map((exp) => (
              <div key={exp.id} className="min-entry">
                <div className="min-entry-top">
                  <span className="min-entry-title">{exp.role}</span>
                  <span className="min-entry-dates">{exp.startDate} — {exp.endDate}</span>
                </div>
                <div className="min-entry-sub">{exp.company}</div>
                {exp.description && <p className="min-entry-desc">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="min-section">
          <h2 className="min-sec-title">Formation</h2>
          <div>
            {education.map((edu) => (
              <div key={edu.id} className="min-entry">
                <div className="min-entry-top">
                  <span className="min-entry-title">{edu.degree}</span>
                  <span className="min-entry-dates">{edu.years}</span>
                </div>
                <div className="min-entry-sub">{edu.school}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="min-section">
          <h2 className="min-sec-title">Projets</h2>
          <div>
            {projects.map((proj) => (
              <div key={proj.id} className="min-entry">
                <div className="min-entry-top">
                  <span className="min-entry-title">{proj.name}</span>
                  {proj.dates && <span className="min-entry-dates">{proj.dates}</span>}
                </div>
                {(proj.role || proj.link) && (
                  <div className="min-entry-sub">
                    {proj.role && <span>{proj.role}</span>}
                    {proj.role && proj.link && <span> — </span>}
                    {proj.link && <span>{proj.link.replace(/^https?:\/\//i, '')}</span>}
                  </div>
                )}
                {proj.description && <p className="min-entry-desc">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <section className="min-section">
          <h2 className="min-sec-title">Compétences</h2>
          <div className="min-skills-list">
            {skills.map((skill, idx) => (
              <span key={idx} className="min-skill-item">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <section className="min-section" style={{ borderBottom: 'none' }}>
          <h2 className="min-sec-title">Langues</h2>
          <div className="min-langs-row">
            {languages.map((lang) => (
              <span key={lang.id} className="min-lang-badge">
                <strong>{lang.name}</strong> ({lang.level})
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
