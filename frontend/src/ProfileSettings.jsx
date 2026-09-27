import React, { useState, useRef } from 'react'
import './user-dashboard.css'
import userAvatarImg from './assets/user_avatar.jpg'

export default function ProfileSettings({ onLogout, currentUser, onSyncProfile }) {
  const [profileTab, setProfileTab] = useState('informations') // 'informations' | 'securite' | 'facturation' | 'notifications'
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
  const profilePhotoInputRef = useRef(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const getStoredPassword = () => {
    const emailToMatch = (currentUser?.email || profileData?.email || '').trim().toLowerCase()
    let user = null
    if (emailToMatch) {
      try {
        user = JSON.parse(localStorage.getItem(`w4j_user_account_${emailToMatch}`))
      } catch {}
    }
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('resumeflow-user'))
      } catch {}
    }
    if (!user && emailToMatch) {
      try {
        const list = JSON.parse(localStorage.getItem('w4j_registered_users')) || []
        user = list.find(u => u.email?.trim().toLowerCase() === emailToMatch)
      } catch {}
    }
    return user?.password || currentUser?.password || ''
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess(false)

    const emailToMatch = (currentUser?.email || profileData?.email || '').trim().toLowerCase()

    let storedUser = null
    try {
      storedUser = JSON.parse(localStorage.getItem('resumeflow-user'))
    } catch {}

    let scopedUser = null
    if (emailToMatch) {
      try {
        scopedUser = JSON.parse(localStorage.getItem(`w4j_user_account_${emailToMatch}`))
      } catch {}
    }

    let usersList = []
    try {
      usersList = JSON.parse(localStorage.getItem('w4j_registered_users')) || []
    } catch {}

    const effectiveUser = scopedUser ||
      (storedUser && (!emailToMatch || storedUser.email?.trim().toLowerCase() === emailToMatch) ? storedUser : null) ||
      usersList.find(u => u.email?.trim().toLowerCase() === emailToMatch) ||
      storedUser ||
      currentUser

    const existingPassword = effectiveUser?.password || currentUser?.password || ''

    if (!newPassword) {
      setPasswordError('Veuillez entrer un nouveau mot de passe.')
      return false
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return false
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.')
      return false
    }

    if (existingPassword && currentPassword !== existingPassword) {
      setPasswordError('Le mot de passe actuel est incorrect.')
      return false
    }

    const finalEmail = effectiveUser?.email || currentUser?.email || profileData?.email || 'user@web4jobs.com'
    const updatedUser = {
      ...(effectiveUser || {}),
      ...(currentUser || {}),
      email: finalEmail,
      password: newPassword
    }

    try {
      localStorage.setItem('resumeflow-user', JSON.stringify(updatedUser))
    } catch {}

    try {
      const emailKey = finalEmail.trim().toLowerCase()
      if (emailKey) {
        localStorage.setItem(`w4j_user_account_${emailKey}`, JSON.stringify(updatedUser))
        let list = JSON.parse(localStorage.getItem('w4j_registered_users')) || []
        const idx = list.findIndex(u => u.email?.trim().toLowerCase() === emailKey)
        if (idx >= 0) list[idx] = updatedUser
        else list.push(updatedUser)
        localStorage.setItem('w4j_registered_users', JSON.stringify(list))
      }
    } catch {}

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSuccess(true)
    setTimeout(() => setPasswordSuccess(false), 5000)
    return true
  }

  const defaultProfileData = {
    firstName: currentUser?.firstName || currentUser?.name?.split(' ')[0] || (currentUser ? '' : 'Moutassim'),
    lastName: currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || (currentUser ? '' : 'Adab'),
    jobTitle: currentUser?.expertise || (currentUser ? '' : 'Développeur Fullstack Senior'),
    location: currentUser ? '' : 'Paris, France',
    email: currentUser?.email || (currentUser ? '' : 'hello@moutassim.me'),
    bio: currentUser ? '' : "Développeur passionné par le Web et l'UI/UX design. J'aide les entreprises à construire des produits digitaux performants et élégants.",
    country: 'France',
    language: 'Français',
    photoUrl: currentUser ? null : userAvatarImg,
    verified: true,
    plan: 'Plan Pro'
  }

  // User-scoped key — isolates data per account
  const userKey = currentUser?.email ? `_${currentUser.email}` : '_guest'

  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(`w4j_user_profile${userKey}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!currentUser || !parsed.email || parsed.email === currentUser.email) {
          return parsed
        }
      }
    } catch {}
    return defaultProfileData
  })

  const handleFieldChange = (field, val) => {
    setProfileData(prev => ({ ...prev, [field]: val }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPhoto = reader.result
        setProfileData(prev => {
          const updated = { ...prev, photoUrl: newPhoto }
          try {
            localStorage.setItem(`w4j_user_profile${userKey}`, JSON.stringify(updated))
          } catch (err) {
            console.error('Error saving profile photo:', err)
          }
          return updated
        })
        if (onSyncProfile) onSyncProfile({ photoUrl: newPhoto })
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoRemove = (e) => {
    e?.stopPropagation()
    setProfileData(prev => {
      const updated = { ...prev, photoUrl: null }
      try {
        localStorage.setItem(`w4j_user_profile${userKey}`, JSON.stringify(updated))
      } catch (err) {
        console.error('Error removing profile photo:', err)
      }
      return updated
    })
    if (onSyncProfile) onSyncProfile({ photoUrl: null })
  }

  const saveProfile = () => {
    try {
      localStorage.setItem(`w4j_user_profile${userKey}`, JSON.stringify(profileData))
      if (onSyncProfile) {
        onSyncProfile(profileData)
      }

      if (profileTab === 'securite' && (currentPassword || newPassword || confirmPassword)) {
        const ok = handleChangePassword()
        if (!ok) return
      }

      setProfileSaveSuccess(true)
      setTimeout(() => setProfileSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible. Toutes vos données et vos CV seront définitivement effacés.')) {
      localStorage.removeItem(`w4j_user_profile${userKey}`)
      localStorage.removeItem(`w4j_user_cv${userKey}`)
      localStorage.removeItem(`w4j_user_cvs${userKey}`)
      localStorage.removeItem('resumeflow-user')
      alert('Votre compte a été supprimé.')
      if (onLogout) onLogout()
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#fcfcfd' }}>
      {/* Topbar with Title & Enregistrer button */}
      <header className="ud-topbar">
        <span className="ud-topbar-title">Paramètres du profil</span>
        <div className="ud-topbar-right">
          <button
            className={`ud-btn-save-profile ${profileSaveSuccess ? 'saved' : ''}`}
            onClick={saveProfile}
          >
            {profileSaveSuccess ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Enregistré
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <div className="ud-profile-view">
        {/* Profile Header Card */}
        <div className="ud-profile-header-card">
          <div className="ud-profile-avatar-wrap">
            {profileData.photoUrl ? (
              <img
                src={profileData.photoUrl}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className="ud-profile-avatar-img"
              />
            ) : (
              <div className="ud-profile-avatar-empty">
                {profileData.firstName || profileData.lastName ? (
                  <span className="ud-avatar-initials">
                    {((profileData.firstName?.[0] || '') + (profileData.lastName?.[0] || '')).toUpperCase()}
                  </span>
                ) : (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
            )}
            <button
              className="ud-profile-avatar-btn"
              onClick={() => profilePhotoInputRef.current?.click()}
              title={profileData.photoUrl ? "Changer la photo de profil" : "Ajouter une photo de profil"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            {profileData.photoUrl && (
              <button
                type="button"
                className="ud-profile-avatar-remove-btn"
                onClick={handlePhotoRemove}
                title="Supprimer la photo de profil"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <input
              type="file"
              ref={profilePhotoInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="ud-profile-header-info">
            <h2 className="ud-profile-header-name">
              {profileData.firstName || profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : (currentUser?.name || 'Mon Profil')}
            </h2>
            <div className="ud-profile-header-sub">
              {profileData.jobTitle ? `${profileData.jobTitle}${profileData.location ? ` • ${profileData.location}` : ''}` : (profileData.location || 'Profil utilisateur')}
            </div>
            <div className="ud-profile-badges-row">
              <span className="ud-profile-badge-verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Compte Vérifié
              </span>
              <span className="ud-profile-badge-pro">
                Plan Pro
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="ud-profile-grid">
          {/* Left Column (Navigation tabs + Promo card) */}
          <div className="ud-profile-sidebar-col">
            {/* Tabs List */}
            <div className="ud-profile-tabs-card">
              <button
                className={`ud-profile-tab-btn ${profileTab === 'informations' ? 'active' : ''}`}
                onClick={() => setProfileTab('informations')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Informations
              </button>

              <button
                className={`ud-profile-tab-btn ${profileTab === 'securite' ? 'active' : ''}`}
                onClick={() => setProfileTab('securite')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Sécurité
              </button>

              <button
                className={`ud-profile-tab-btn ${profileTab === 'facturation' ? 'active' : ''}`}
                onClick={() => setProfileTab('facturation')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Facturation
              </button>

              <button
                className={`ud-profile-tab-btn ${profileTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setProfileTab('notifications')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
              </button>
            </div>

            {/* Promo Card: Passez au Plan Expert */}
            <div className="ud-profile-promo-card">
              <h3 className="ud-profile-promo-title">Passez au Plan Expert</h3>
              <p className="ud-profile-promo-desc">
                Accédez à des modèles exclusifs et au téléchargement illimité.
              </p>
              <button
                className="ud-profile-promo-btn"
                onClick={() => setProfileTab('facturation')}
              >
                VOIR LES OFFRES
              </button>
            </div>
          </div>

          {/* Right Column (Form Cards) */}
          <div className="ud-profile-main-col">
            {profileTab === 'informations' && (
              <>
                {/* Card 1: Détails du compte */}
                <div className="ud-profile-card">
                  <h3 className="ud-profile-card-title">Détails du compte</h3>

                  <div className="ud-profile-fields-row">
                    <div className="ud-profile-field-group">
                      <label className="ud-profile-field-label">PRÉNOM</label>
                      <input
                        type="text"
                        className="ud-profile-input"
                        value={profileData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="ud-profile-field-group">
                      <label className="ud-profile-field-label">NOM</label>
                      <input
                        type="text"
                        className="ud-profile-input"
                        value={profileData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ud-profile-field-group">
                    <label className="ud-profile-field-label">ADRESSE E-MAIL</label>
                    <input
                      type="email"
                      className="ud-profile-input"
                      value={profileData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  </div>

                  <div className="ud-profile-field-group">
                    <label className="ud-profile-field-label">EXPERTISE / TITRE DE POSTE</label>
                    <input
                      type="text"
                      className="ud-profile-input"
                      placeholder="ex : Développeur Fullstack, Designer UI/UX..."
                      value={profileData.jobTitle || ''}
                      onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                    />
                  </div>

                  <div className="ud-profile-field-group" style={{ marginBottom: 0 }}>
                    <label className="ud-profile-field-label">BIO COURTE</label>
                    <textarea
                      className="ud-profile-textarea"
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                    />
                  </div>
                </div>


                {/* Card 2: Localisation & Langue */}
                <div className="ud-profile-card">
                  <h3 className="ud-profile-card-title">Localisation & Langue</h3>

                  <div className="ud-profile-fields-row" style={{ marginBottom: 0 }}>
                    <div className="ud-profile-field-group" style={{ marginBottom: 0 }}>
                      <label className="ud-profile-field-label">PAYS</label>
                      <input
                        type="text"
                        className="ud-profile-input"
                        value={profileData.country}
                        onChange={(e) => handleFieldChange('country', e.target.value)}
                      />
                    </div>
                    <div className="ud-profile-field-group" style={{ marginBottom: 0 }}>
                      <label className="ud-profile-field-label">LANGUE DE L'INTERFACE</label>
                      <input
                        type="text"
                        className="ud-profile-input"
                        value={profileData.language}
                        onChange={(e) => handleFieldChange('language', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Zone de danger */}
                <div className="ud-profile-danger-card">
                  <h3 className="ud-profile-danger-title">Zone de danger</h3>
                  <p className="ud-profile-danger-text">
                    La suppression de votre compte est irréversible. Toutes vos données et vos CV seront définitivement effacés.
                  </p>
                  <button
                    type="button"
                    className="ud-profile-danger-btn"
                    onClick={handleDeleteAccount}
                  >
                    SUPPRIMER MON COMPTE
                  </button>
                </div>
              </>
            )}

            {profileTab === 'securite' && (
              <div className="ud-profile-card">
                <h3 className="ud-profile-card-title">Sécurité du compte</h3>

                <div className="ud-profile-field-group">
                  <label className="ud-profile-field-label">MOT DE PASSE ACTUEL</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      className="ud-profile-input"
                      placeholder="Entrez votre mot de passe actuel"
                      style={{ paddingRight: '44px' }}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      title={showCurrentPass ? 'Masquer' : 'Afficher'}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                      {showCurrentPass ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="ud-profile-fields-row">
                  <div className="ud-profile-field-group">
                    <label className="ud-profile-field-label">NOUVEAU MOT DE PASSE</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="ud-profile-input"
                        placeholder="Minimum 8 caractères"
                        style={{ paddingRight: '44px' }}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        title={showNewPass ? 'Masquer' : 'Afficher'}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        {showNewPass ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="ud-profile-field-group">
                    <label className="ud-profile-field-label">CONFIRMER LE MOT DE PASSE</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="ud-profile-input"
                        placeholder="Répéter le mot de passe"
                        style={{ paddingRight: '44px' }}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        title={showConfirmPass ? 'Masquer' : 'Afficher'}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        {showConfirmPass ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {passwordError && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '10px', color: '#be123c', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span>
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div style={{ marginTop: '14px', padding: '12px 16px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✅</span>
                    <span>Mot de passe mis à jour avec succès ! Vous pouvez maintenant l'utiliser pour vous connecter.</span>
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    style={{ padding: '11px 26px', background: '#3e2675', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(62, 38, 117, 0.25)' }}
                    onMouseOver={e => e.currentTarget.style.background = '#5b21b6'}
                    onMouseOut={e => e.currentTarget.style.background = '#3e2675'}
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>

                <div style={{ marginTop: '24px', padding: '16px 20px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Authentification à deux facteurs (2FA)</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Sécurisez votre compte avec la validation par code SMS ou appli.</div>
                  </div>
                  <button type="button" style={{ padding: '8px 16px', background: '#3e2675', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Activer
                  </button>
                </div>
              </div>
            )}

            {profileTab === 'facturation' && (
              <div className="ud-profile-card">
                <h3 className="ud-profile-card-title">Abonnement & Facturation</h3>
                <div style={{ padding: '20px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#3e2675' }}>Formule Actuelle : Plan Pro</span>
                    <span style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>ACTIF</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>9,99 € / mois · Renouvellement automatique le 24 Octobre 2026</p>
                </div>
                <div className="ud-profile-field-group">
                  <label className="ud-profile-field-label">MODE DE PAIEMENT ENREGISTRÉ</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: '10px' }}>
                    <span style={{ fontSize: '18px' }}>💳</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>Visa se terminant par •••• 4242</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>Expire le 12/28</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'notifications' && (
              <div className="ud-profile-card">
                <h3 className="ud-profile-card-title">Préférences de notification</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { title: 'Téléchargements et vues de CV', desc: 'Recevoir un email quand un recruteur consulte votre profil.' },
                    { title: 'Nouveaux modèles et mises à jour ATS', desc: 'Être informé des nouvelles fonctionnalités et designs.' },
                    { title: 'Rappels et conseils carrière', desc: 'Recevoir notre newsletter hebdomadaire avec des conseils d\'experts.' }
                  ].map((item, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: '#f8fafc' }}>
                      <input type="checkbox" defaultChecked={idx < 2} style={{ marginTop: '3px', accentColor: '#3e2675', width: '16px', height: '16px' }} />
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Success Toast */}
        {profileSaveSuccess && (
          <div className="ud-profile-toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Vos modifications ont bien été enregistrées !
          </div>
        )}
      </div>
    </div>
  )
}
