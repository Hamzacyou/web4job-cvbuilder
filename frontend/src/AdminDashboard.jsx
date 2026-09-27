import React, { useState, useEffect } from 'react'
import './admin-dashboard.css'
import userAvatarImg from './assets/user_avatar.jpg'
import logoLightImg from './assets/logo-light.png'
import ProfileSettings from './ProfileSettings'

function AdminDashboard({ onLogout, onNavigate, onSwitchRole }) {
  const [activeNav, setActiveNav] = useState('overview') // 'overview' | 'users' | 'documents' | 'settings'
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'recent_cvs' | 'reports'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'actif' | 'inactif' | 'nouveau'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCvPreview, setSelectedCvPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  // Stats matching screenshot
  const [stats, setStats] = useState({
    totalUsers: '1,284',
    usersChange: '+12%',
    cvsCreated: '3,450',
    cvsChange: '+5%',
    pdfExports: '8,920',
    exportsBadge: 'High',
    supportAlerts: 14,
    alertsBadge: 'Action requise'
  })

  // Users data matching screenshot
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      avatar: userAvatarImg,
      inscriptionDate: '12 Sep 2023',
      inscriptionRelative: 'Il y a 2 mois',
      cvsCount: 4,
      status: 'ACTIF'
    },
    {
      id: 2,
      name: 'Jean Dupont',
      email: 'j.dupont@company.fr',
      avatar: null,
      inscriptionDate: '05 Oct 2023',
      inscriptionRelative: 'Il y a 1 mois',
      cvsCount: 1,
      status: 'INACTIF'
    },
    {
      id: 3,
      name: 'Amélie Leroy',
      email: 'amelie.leroy@outlook.com',
      avatar: null,
      inscriptionDate: '18 Nov 2023',
      inscriptionRelative: "aujourd'hui",
      cvsCount: 0,
      status: 'NOUVEAU'
    }
  ])

  // Recent CVs generated on the platform matching screenshot
  const [recentCvs, setRecentCvs] = useState([
    {
      id: 1,
      title: 'Développeur Fullstack',
      author: 'Sophie Martin',
      model: 'MODERNE',
      modelColor: '#2563eb',
      createdAt: '12/11/2023',
      skills: ['React', 'Node.js', 'TypeScript', 'Docker'],
      summary: 'Développeur Fullstack expérimenté spécialisé dans les architectures cloud et React/Node.'
    },
    {
      id: 2,
      title: 'Consultant RH',
      author: 'Jean Dupont',
      model: 'ÉLÉGANT',
      modelColor: '#059669',
      createdAt: '10/11/2023',
      skills: ['Recrutement', 'Gestion des talents', 'Droit social'],
      summary: 'Consultant RH sénior avec plus de 8 ans d’expérience en acquisition de talents.'
    },
    {
      id: 3,
      title: 'Data Analyst',
      author: 'Sophie Martin',
      model: 'CRÉATIF',
      modelColor: '#7c3aed',
      createdAt: '09/11/2023',
      skills: ['Python', 'SQL', 'PowerBI', 'Machine Learning'],
      summary: 'Analyste de données passionnée par la modélisation statistique et la visualisation.'
    }
  ])

  // Support alerts / reports for the 3rd tab
  const [reports, setReports] = useState([
    { id: 1, user: 'Lucas Bernard', type: 'Export PDF', message: 'Erreur lors du téléchargement de police personnalisée', date: 'Il y a 20 min', severity: 'Moyenne' },
    { id: 2, user: 'Claire Dubois', type: 'Compte', message: 'Demande de suppression de données RGPD', date: 'Il y a 2 heures', severity: 'Haute' },
    { id: 3, user: 'Thomas Moreau', type: 'Paiement', message: 'Facture non générée pour abonnement annuel', date: 'Hier', severity: 'Basse' }
  ])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/all')
      if (response.ok) {
        const data = await response.json()
        if (data.stats) {
          setStats(prev => ({
            ...prev,
            totalUsers: data.stats.totalUsers ? data.stats.totalUsers.toLocaleString('fr-FR') : prev.totalUsers,
            cvsCreated: data.stats.cvsCreated ? data.stats.cvsCreated.toLocaleString('fr-FR') : prev.cvsCreated,
            pdfExports: data.stats.pdfExports ? data.stats.pdfExports.toLocaleString('fr-FR') : prev.pdfExports
          }))
        }
        if (data.users && data.users.length > 0) {
          // Format API users
          const formatted = data.users.map((u, idx) => ({
            id: u.id || idx + 10,
            name: u.name,
            email: u.email,
            avatar: idx === 0 ? userAvatarImg : null,
            inscriptionDate: u.joinDate || '12 Sep 2023',
            inscriptionRelative: u.joinDate || 'Récemment',
            cvsCount: u.cvsCreated || 0,
            status: (u.status || 'ACTIF').toUpperCase()
          }))
          // Merge with mockup users to preserve screenshot look
          setUsers(prev => {
            const existingEmails = new Set(prev.map(p => p.email))
            const newFromApi = formatted.filter(f => !existingEmails.has(f.email))
            return [...prev, ...newFromApi]
          })
        }
      }
    } catch {
      // Fallback kept
    }
  }

  // Filtered users according to search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = 
      statusFilter === 'all' || 
      user.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Filtered CVs according to search
  const filteredCvs = recentCvs.filter(cv => {
    return (
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Toggle user status
  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        let nextStatus = 'ACTIF'
        if (u.status === 'ACTIF') nextStatus = 'INACTIF'
        else if (u.status === 'INACTIF') nextStatus = 'ACTIF'
        else if (u.status === 'NOUVEAU') nextStatus = 'ACTIF'
        return { ...u, status: nextStatus }
      }
      return u
    }))
  }

  // Delete user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  // Delete CV
  const handleDeleteCv = (cvId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce CV ?')) {
      setRecentCvs(prev => prev.filter(cv => cv.id !== cvId))
    }
  }

  return (
    <div className="w4j-admin-root">
      {/* ====================================================================
          1. EXACT SAME PURPLE SIDEBAR AS USER DASHBOARD
          ==================================================================== */}
      <aside className="ud-sidebar">
        {/* Brand Logo with logo-light.png */}
        <div
          className="ud-logo-area"
          onClick={() => { setActiveNav('overview'); setActiveTab('users'); }}
          title="Web4Jobs - Espace Administration"
        >
          <img src={logoLightImg} alt="Web4Jobs" className="ud-sidebar-logo-img" />
        </div>

        {/* Navigation Icons */}
        <nav className="ud-nav-list">
          {/* 1. Home / Vue d'ensemble */}
          <button
            className={`ud-nav-item ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveNav('overview'); setActiveTab('users'); }}
            title="Tableau de bord"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>

          {/* 2. Documents / CVs icon with orange/amber badge */}
          <button
            className={`ud-nav-item ${activeNav === 'documents' ? 'active' : ''}`}
            onClick={() => { setActiveNav('documents'); setActiveTab('recent_cvs'); }}
            title="CVs & Documents"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="ud-nav-badge">{recentCvs.length || 1}</span>
          </button>

          {/* 3. Modèles / Utilisateurs (Layers icon) */}
          <button
            className={`ud-nav-item ${activeNav === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveNav('users'); setActiveTab('users'); }}
            title="Gestion des utilisateurs"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>

          <div className="ud-nav-divider" />

          {/* 4. Settings / Profile icon */}
          <button
            className={`ud-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
            title="Paramètres du profil"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </nav>

        {/* Sidebar Bottom: Role switch + Logout */}
        <div className="ud-sidebar-bottom">
          {onSwitchRole && (
            <button
              className="ud-nav-item"
              onClick={() => onSwitchRole('user')}
              title="Passer au Dashboard Utilisateur"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </button>
          )}

          <button
            className="ud-nav-item"
            onClick={onLogout}
            title="Déconnexion"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. MAIN CONTENT AREA
          ==================================================================== */}
      <main className="w4j-admin-main">
        {activeNav === 'settings' ? (
          <div className="w4j-admin-settings-container">
            <div className="w4j-admin-settings-header">
              <button className="w4j-back-btn" onClick={() => setActiveNav('overview')}>
                ← Retour au tableau de bord
              </button>
              <h2>Paramètres du compte administrateur</h2>
            </div>
            <ProfileSettings onLogout={onLogout} />
          </div>
        ) : (
          <>
            {/* Top Bar Header */}
            <header className="w4j-admin-header">
              <div className="w4j-admin-title-area">
                <h1 className="w4j-admin-page-title">Espace Administration</h1>
                <span className="w4j-admin-badge-pill">ADMIN ACCESS</span>
              </div>

              <div className="w4j-admin-header-actions">
                {/* Search Bar matching screenshot */}
                <div className="w4j-admin-search-box">
                  <svg className="w4j-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Utilisateur, email, CV..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="w4j-search-clear" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>

                {/* Admin Avatar Profile */}
                <div className="w4j-admin-profile-avatar" onClick={() => setActiveNav('settings')} title="Profil Administrateur">
                  <img src={userAvatarImg} alt="Admin" className="w4j-admin-avatar-img" />
                </div>
              </div>
            </header>

            {/* ================================================================
                3. STATS CARDS ROW (4 Cards matching screenshot)
                ================================================================ */}
            <section className="w4j-admin-stats-grid">
              {/* Card 1: Total Utilisateurs */}
              <div className="w4j-stat-card">
                <div className="w4j-stat-left">
                  <span className="w4j-stat-label">Total Utilisateurs</span>
                  <div className="w4j-stat-value">{stats.totalUsers}</div>
                </div>
                <div className="w4j-stat-pill w4j-pill-success">
                  {stats.usersChange}
                </div>
              </div>

              {/* Card 2: CV Créés */}
              <div className="w4j-stat-card">
                <div className="w4j-stat-left">
                  <span className="w4j-stat-label">CV Créés</span>
                  <div className="w4j-stat-value">{stats.cvsCreated}</div>
                </div>
                <div className="w4j-stat-pill w4j-pill-success">
                  {stats.cvsChange}
                </div>
              </div>

              {/* Card 3: Exports PDF */}
              <div className="w4j-stat-card">
                <div className="w4j-stat-left">
                  <span className="w4j-stat-label">Exports PDF</span>
                  <div className="w4j-stat-value">{stats.pdfExports}</div>
                </div>
                <div className="w4j-stat-pill w4j-pill-purple">
                  {stats.exportsBadge}
                </div>
              </div>

              {/* Card 4: Alertes Support */}
              <div className="w4j-stat-card">
                <div className="w4j-stat-left">
                  <span className="w4j-stat-label">Alertes Support</span>
                  <div className="w4j-stat-value">{stats.supportAlerts}</div>
                </div>
                <div className="w4j-stat-pill w4j-pill-warning">
                  {stats.alertsBadge}
                </div>
              </div>
            </section>

            {/* ================================================================
                4. MAIN WHITE PANEL (Tabs + Table + Filter + Pagination)
                ================================================================ */}
            <section className="w4j-admin-table-card">
              {/* Tab Header Row */}
              <div className="w4j-table-card-header">
                <div className="w4j-table-tabs">
                  <button
                    className={`w4j-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    Utilisateurs
                  </button>
                  <button
                    className={`w4j-tab-btn ${activeTab === 'recent_cvs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recent_cvs')}
                  >
                    CV récents
                  </button>
                  <button
                    className={`w4j-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Signalements
                  </button>
                </div>

                {/* Filter Dropdown */}
                <div className="w4j-filter-wrapper">
                  <button
                    className={`w4j-filter-btn ${statusFilter !== 'all' ? 'filtered' : ''}`}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    FILTRER {statusFilter !== 'all' ? `(${statusFilter.toUpperCase()})` : ''}
                  </button>

                  {showFilterDropdown && (
                    <div className="w4j-filter-dropdown">
                      <button className={statusFilter === 'all' ? 'selected' : ''} onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false) }}>Tous les statuts</button>
                      <button className={statusFilter === 'actif' ? 'selected' : ''} onClick={() => { setStatusFilter('actif'); setShowFilterDropdown(false) }}>Actif</button>
                      <button className={statusFilter === 'inactif' ? 'selected' : ''} onClick={() => { setStatusFilter('inactif'); setShowFilterDropdown(false) }}>Inactif</button>
                      <button className={statusFilter === 'nouveau' ? 'selected' : ''} onClick={() => { setStatusFilter('nouveau'); setShowFilterDropdown(false) }}>Nouveau</button>
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: USERS TABLE */}
              {activeTab === 'users' && (
                <>
                  <div className="w4j-table-responsive">
                    <table className="w4j-custom-table">
                      <thead>
                        <tr>
                          <th>IDENTITÉ / EMAIL</th>
                          <th>INSCRIPTION</th>
                          <th>CV CRÉÉS</th>
                          <th>STATUT</th>
                          <th className="th-actions">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="w4j-empty-row">
                              Aucun utilisateur trouvé correspondant aux critères.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="w4j-table-row">
                              {/* Identité / Email */}
                              <td>
                                <div className="w4j-user-identity">
                                  <div className="w4j-avatar-wrap">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w4j-user-photo" />
                                    ) : (
                                      <div className="w4j-avatar-initials">
                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="w4j-user-names">
                                    <span className="w4j-user-fullname">{user.name}</span>
                                    <span className="w4j-user-email">{user.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Inscription */}
                              <td>
                                <div className="w4j-date-wrap">
                                  <span className="w4j-date-main">{user.inscriptionDate}</span>
                                  <span className="w4j-date-sub">{user.inscriptionRelative}</span>
                                </div>
                              </td>

                              {/* CV Créés */}
                              <td>
                                <span className="w4j-cv-count-badge">
                                  {user.cvsCount}
                                </span>
                              </td>

                              {/* Statut */}
                              <td>
                                <span className={`w4j-status-pill status-${user.status.toLowerCase()}`}>
                                  {user.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td>
                                <div className="w4j-row-actions">
                                  {/* View / Folder icon */}
                                  <button
                                    className="w4j-action-icon-btn"
                                    title="Voir le dossier"
                                    onClick={() => alert(`Détails de l'utilisateur: ${user.name}\nEmail: ${user.email}\nCVs créés: ${user.cvsCount}`)}
                                  >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                  </button>

                                  {/* Toggle Status icon */}
                                  <button
                                    className="w4j-action-icon-btn"
                                    title={`Changer le statut (actuellement ${user.status})`}
                                    onClick={() => toggleUserStatus(user.id)}
                                  >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={user.status === 'ACTIF' ? '#d97706' : '#16a34a'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                      <circle cx="8.5" cy="7" r="4" />
                                      <line x1="20" y1="8" x2="20" y2="14" />
                                      <line x1="23" y1="11" x2="17" y2="11" />
                                    </svg>
                                  </button>

                                  {/* Delete icon */}
                                  <button
                                    className="w4j-action-icon-btn action-delete"
                                    title="Supprimer l'utilisateur"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer with Pagination matching screenshot */}
                  <div className="w4j-table-footer">
                    <span className="w4j-pagination-info">
                      Affichage de 1 à {filteredUsers.length} sur {stats.totalUsers} utilisateurs
                    </span>

                    <div className="w4j-pagination-nav">
                      <button
                        className="w4j-page-btn arrow"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        ‹
                      </button>
                      <button
                        className={`w4j-page-btn ${currentPage === 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                      <button
                        className={`w4j-page-btn ${currentPage === 2 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(2)}
                      >
                        2
                      </button>
                      <button
                        className={`w4j-page-btn ${currentPage === 3 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(3)}
                      >
                        3
                      </button>
                      <button
                        className="w4j-page-btn arrow"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: CV RECENTS LIST */}
              {activeTab === 'recent_cvs' && (
                <div className="w4j-recent-cvs-tab-content">
                  <div className="w4j-cv-tab-grid">
                    {filteredCvs.map(cv => (
                      <div key={cv.id} className="w4j-cv-row-item">
                        <div className="w4j-cv-row-left">
                          <span className="w4j-cv-tag">{cv.model}</span>
                          <strong>{cv.title}</strong>
                          <span className="w4j-cv-author">Par {cv.author} · Créé le {cv.createdAt}</span>
                        </div>
                        <div className="w4j-cv-row-actions">
                          <button className="w4j-pill-btn-view" onClick={() => setSelectedCvPreview(cv)}>VOIR</button>
                          <button className="w4j-pill-btn-del" onClick={() => handleDeleteCv(cv.id)}>SUPPRIMER</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SIGNALEMENTS / SUPPORT ALERTS */}
              {activeTab === 'reports' && (
                <div className="w4j-reports-tab-content">
                  <table className="w4j-custom-table">
                    <thead>
                      <tr>
                        <th>UTILISATEUR</th>
                        <th>TYPE DE SIGNALEMENT</th>
                        <th>DÉTAILS</th>
                        <th>DATE</th>
                        <th>GRAVITÉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(rep => (
                        <tr key={rep.id} className="w4j-table-row">
                          <td><strong>{rep.user}</strong></td>
                          <td><span className="w4j-cv-tag">{rep.type}</span></td>
                          <td>{rep.message}</td>
                          <td><span className="w4j-date-sub">{rep.date}</span></td>
                          <td>
                            <span className={`w4j-status-pill ${rep.severity === 'Haute' ? 'status-inactif' : 'status-nouveau'}`}>
                              {rep.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ================================================================
                5. BOTTOM SECTION: DERNIERS CV GÉNÉRÉS SUR LA PLATEFORME
                ================================================================ */}
            <section className="w4j-admin-bottom-section">
              <div className="w4j-bottom-section-header">
                <h2 className="w4j-bottom-section-title">Derniers CV générés sur la plateforme</h2>
                <button
                  className="w4j-view-all-link"
                  onClick={() => { setActiveTab('recent_cvs'); window.scrollTo({ top: 300, behavior: 'smooth' }) }}
                >
                  VOIR TOUS LES DOCUMENTS →
                </button>
              </div>

              {/* 3 CV Cards Grid matching screenshot */}
              <div className="w4j-recent-cv-cards-grid">
                {filteredCvs.map((cv) => (
                  <div key={cv.id} className="w4j-admin-cv-card">
                    {/* Three dots menu */}
                    <button
                      className="w4j-cv-card-dots"
                      onClick={() => alert(`Actions pour: ${cv.title}`)}
                      title="Plus d'actions"
                    >
                      ⋮
                    </button>

                    {/* Miniature CV Preview */}
                    <div className="w4j-cv-miniature" onClick={() => setSelectedCvPreview(cv)}>
                      <div className="w4j-miniature-paper">
                        <div className="w4j-mini-header" style={{ borderTop: `3px solid ${cv.modelColor || '#3e2675'}` }}>
                          <div className="w4j-mini-avatar-dot"></div>
                          <div className="w4j-mini-lines">
                            <div className="w4j-mini-line w4j-line-bold" style={{ width: '80%' }}></div>
                            <div className="w4j-mini-line" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                        <div className="w4j-mini-body">
                          <div className="w4j-mini-col-left">
                            <div className="w4j-mini-line" style={{ width: '90%' }}></div>
                            <div className="w4j-mini-line" style={{ width: '70%' }}></div>
                            <div className="w4j-mini-line" style={{ width: '85%' }}></div>
                          </div>
                          <div className="w4j-mini-col-right">
                            <div className="w4j-mini-line" style={{ width: '100%' }}></div>
                            <div className="w4j-mini-line" style={{ width: '95%' }}></div>
                            <div className="w4j-mini-line" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CV Info & Actions */}
                    <div className="w4j-cv-info">
                      <h3 className="w4j-cv-title">{cv.title}</h3>
                      <p className="w4j-cv-author">Par : {cv.author}</p>
                      <div className="w4j-cv-model-label">MODÈLE : {cv.model}</div>
                      <div className="w4j-cv-date">Créé le {cv.createdAt}</div>

                      {/* Action buttons matching screenshot */}
                      <div className="w4j-cv-card-actions">
                        <button
                          className="w4j-btn-card-view"
                          onClick={() => setSelectedCvPreview(cv)}
                        >
                          VOIR
                        </button>
                        <button
                          className="w4j-btn-card-delete"
                          onClick={() => handleDeleteCv(cv.id)}
                        >
                          SUPPRIMER
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ====================================================================
          6. MODAL: PREVIEW CV DETAILS
          ==================================================================== */}
      {selectedCvPreview && (
        <div className="w4j-modal-overlay" onClick={() => setSelectedCvPreview(null)}>
          <div className="w4j-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="w4j-modal-header">
              <div>
                <span className="w4j-cv-model-label">MODÈLE : {selectedCvPreview.model}</span>
                <h2>{selectedCvPreview.title}</h2>
                <p>Créé par <strong>{selectedCvPreview.author}</strong> le {selectedCvPreview.createdAt}</p>
              </div>
              <button className="w4j-modal-close" onClick={() => setSelectedCvPreview(null)}>×</button>
            </div>

            <div className="w4j-modal-body">
              <div className="w4j-modal-preview-doc">
                <div className="w4j-doc-header-banner" style={{ background: selectedCvPreview.modelColor || '#3e2675' }}>
                  <h3>{selectedCvPreview.title}</h3>
                  <span>{selectedCvPreview.author}</span>
                </div>
                <div className="w4j-doc-content-sample">
                  <p className="w4j-doc-summary">{selectedCvPreview.summary}</p>
                  <h4>Compétences</h4>
                  <div className="w4j-doc-skills-list">
                    {selectedCvPreview.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="w4j-doc-skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w4j-modal-footer">
              <button className="w4j-btn-secondary" onClick={() => setSelectedCvPreview(null)}>Fermer</button>
              <button className="w4j-btn-card-delete" onClick={() => { handleDeleteCv(selectedCvPreview.id); setSelectedCvPreview(null) }}>Supprimer ce CV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
