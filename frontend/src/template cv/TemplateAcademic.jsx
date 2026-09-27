import React from 'react'
import './templates.css'

export default function TemplateAcademic({ cvData = {}, innerRef }) {
  const {
    firstName = '',
    lastName = '',
    jobTitle = '',
    email = '',
    phone = '',
    location = '',
    experiences = [],
    education = [],
    projects = [],
    skills = [],
    languages = []
  } = cvData

  return (
    <div className="tpl-paper ud-resume-paper tpl-academic" ref={innerRef}>
      {/* Formal Header */}
      <header className="acd-header">
        <h1 className="acd-name">{firstName} {lastName}</h1>
        {jobTitle && <div className="acd-title">{jobTitle}</div>}

        <div className="acd-contacts">
          {email && <span>{email}</span>}
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
        </div>
      </header>

      {/* Education First (Traditional Academic Priority) */}
      {education && education.length > 0 && (
        <section>
          <h2 className="acd-sec-title">Formation & Titres Universitaires</h2>
          {education.map((edu) => (
            <div key={edu.id} className="acd-item">
              <div className="acd-item-header">
                <span className="acd-item-bold">{edu.degree}</span>
                <span className="acd-item-dates">{edu.years}</span>
              </div>
              <div className="acd-item-sub">{edu.school}</div>
            </div>
          ))}
        </section>
      )}

      {/* Academic & Professional Appointments */}
      {experiences && experiences.length > 0 && (
        <section>
          <h2 className="acd-sec-title">Expérience Académique & Professionnelle</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="acd-item">
              <div className="acd-item-header">
                <span className="acd-item-bold">{exp.role} — {exp.company}</span>
                <span className="acd-item-dates">{exp.startDate} — {exp.endDate}</span>
              </div>
              {exp.description && <p className="acd-item-desc">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Projects & Research */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="acd-sec-title">Projets Académiques & Réalisations</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="acd-item">
              <div className="acd-item-header">
                <span className="acd-item-bold">{proj.name} {proj.role ? `— ${proj.role}` : ''}</span>
                {proj.dates && <span className="acd-item-dates">{proj.dates}</span>}
              </div>
              {proj.link && (
                <div style={{ fontSize: '11px', color: '#047857', marginBottom: '3px' }}>
                  {proj.link}
                </div>
              )}
              {proj.description && <p className="acd-item-desc">{proj.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Two Column: Skills & Languages */}
      <div className="acd-two-col">
        {skills && skills.length > 0 && (
          <section>
            <h2 className="acd-sec-title">Domaines d'Expertise</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', lineHeight: 1.6, color: '#374151' }}>
              {skills.map((skill, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{skill}</li>
              ))}
            </ul>
          </section>
        )}

        {languages && languages.length > 0 && (
          <section>
            <h2 className="acd-sec-title">Compétences Linguistiques</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', lineHeight: 1.6, color: '#374151' }}>
              {languages.map((lang) => (
                <li key={lang.id} style={{ marginBottom: 4 }}>
                  <strong>{lang.name}</strong> : {lang.level}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
