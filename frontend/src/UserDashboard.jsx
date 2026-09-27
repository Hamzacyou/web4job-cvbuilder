import React, { useState, useEffect, useRef } from 'react'
import * as ReactDOM from 'react-dom/client'
import './user-dashboard.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Generated and high quality assets
import userAvatarImg from './assets/user_avatar.jpg'
import templateExecutiveImg from './assets/template_executive.jpg'
import templateCreativeImg from './assets/template_creative.jpg'
import templateEssentialImg from './assets/template_essential.jpg'
import templateMinimalistImg from './assets/template_minimalist.jpg'
import templateAcademicImg from './assets/template_academic.jpg'
import templateTechImg from './assets/template_tech.jpg'
import templateElegantImg from './assets/template_elegant.jpg'
import logoLightImg from './assets/logo-light.png'
import { RenderCvTemplate, TEMPLATES_MAP } from './template cv'

export default function UserDashboard({ onLogout, onSwitchRole, currentUser, onUpdateUser }) {
  // Navigation / Views: 'my-cvs' | 'templates' | 'builder' | 'profile'
  const [currentView, setCurrentView] = useState('dashboard')
  const [activeCategory, setActiveCategory] = useState('Tous les modèles')
  const [selectedTemplate, setSelectedTemplate] = useState('essential')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [savedStatus, setSavedStatus] = useState('ENREGISTRÉ')
  const fileInputRef = useRef(null)
  const resumePaperRef = useRef(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  // User-scoped localStorage key prefix — isolates data per account
  const userKey = currentUser?.email ? `_${currentUser.email.trim().toLowerCase()}` : '_guest'

  // Multi-CV list state
  const [cvList, setCvList] = useState(() => {
    try {
      const saved = localStorage.getItem(`w4j_user_cvs${userKey}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [activeCvId, setActiveCvId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Initial resume data - use currentUser signup data if available
  const defaultCvData = {
    title: currentUser ? `${currentUser.expertise || 'Mon CV'}.pdf` : 'Développeur Fullstack.pdf',
    firstName: currentUser?.firstName || currentUser?.name?.split(' ')[0] || (currentUser ? '' : 'Moutassim'),
    lastName: currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || (currentUser ? '' : 'Adab'),
    jobTitle: currentUser?.expertise || (currentUser ? '' : 'Développeur Fullstack Senior'),
    email: currentUser?.email || (currentUser ? '' : 'hello@moutassim.me'),
    phone: '',
    location: currentUser ? '' : 'Paris, France',
    photoUrl: currentUser ? null : userAvatarImg,
    experiences: currentUser ? [] : [
      {
        id: 1,
        company: 'Tech Innovations Inc.',
        role: 'Lead Developer Fullstack',
        startDate: 'Jan 2021',
        endDate: 'Présent',
        description: "Développement d'applications SaaS complexes en utilisant React et Node.js. Lead technique sur 3 projets majeurs ayant généré plus de 1M€ de revenus annuels. Optimisation des performances front-end (réduction du LCP de 40%)."
      },
      {
        id: 2,
        company: 'Creative Web Studio',
        role: 'Développeur Web Junior',
        startDate: 'Mar 2018',
        endDate: 'Déc 2020',
        description: "Conception et maintenance de plus de 20 sites e-commerce sous WordPress et Shopify. Collaboration étroite avec l'équipe design pour assurer la fidélité des maquettes."
      }
    ],
    education: currentUser ? [] : [
      {
        id: 1,
        degree: 'Master en Informatique',
        school: 'Université de Technologie de Compiègne (UTC)',
        years: '2016 — 2018'
      }
    ],
    projects: currentUser ? [] : [
      {
        id: 1,
        name: 'Plateforme E-Commerce SaaS',
        role: 'Lead Developer',
        dates: '2023',
        description: "Architecture et déploiement d'une solution de vente en ligne haute performance avec passerelle de paiement Stripe et analytics.",
        link: 'https://github.com/moutassim/ecommerce-saas'
      }
    ],
    skills: currentUser?.expertise ? [currentUser.expertise] : ['React.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Docker', 'AWS'],
    languages: [
      { id: 1, name: 'Français', level: 'NATIF' },
      { id: 2, name: 'Anglais', level: 'AVANCÉ' }
    ]
  }

  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem(`w4j_user_cv${userKey}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!currentUser || !parsed.email || parsed.email === currentUser.email) {
          return parsed
        }
      }
    } catch {}
    return defaultCvData
  })

  const [newSkillInput, setNewSkillInput] = useState('')

  // Profile Settings state
  const [profileTab, setProfileTab] = useState('informations')
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

    // Only verify current password if one is already recorded in the account
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

    if (onUpdateUser) {
      onUpdateUser(updatedUser)
    }

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

  // Sync profile, CV, and CV list when currentUser changes
  useEffect(() => {
    if (currentUser) {
      try {
        const savedProfile = localStorage.getItem(`w4j_user_profile${userKey}`)
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile)
          if ((parsed.email || '').trim().toLowerCase() === (currentUser.email || '').trim().toLowerCase()) {
            setProfileData(parsed)
          }
        }
        const savedCv = localStorage.getItem(`w4j_user_cv${userKey}`)
        if (savedCv) {
          const parsedCv = JSON.parse(savedCv)
          if ((parsedCv.email || '').trim().toLowerCase() === (currentUser.email || '').trim().toLowerCase()) {
            setCvData(parsedCv)
          }
        } else {
          setCvData(defaultCvData)
        }

        // Reload the user's specific CV list
        const savedCvs = localStorage.getItem(`w4j_user_cvs${userKey}`)
        if (savedCvs) {
          setCvList(JSON.parse(savedCvs))
        } else {
          setCvList([])
        }
        setActiveCvId(null)
      } catch {}
    } else {
      setCvList([])
      setCvData(defaultCvData)
    }
  }, [currentUser, userKey])

  const handleProfileFieldChange = (field, val) => {
    setProfileData(prev => ({ ...prev, [field]: val }))
  }

  const saveProfile = () => {
    try {
      localStorage.setItem(`w4j_user_profile${userKey}`, JSON.stringify(profileData))
      setCvData(prev => ({
        ...prev,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        jobTitle: profileData.jobTitle,
        location: profileData.location
      }))

      // If user is on the security tab or has entered password fields, also update password
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

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const photo = reader.result
        setProfileData(prev => {
          const updated = { ...prev, photoUrl: photo }
          try {
            localStorage.setItem(`w4j_user_profile${userKey}`, JSON.stringify(updated))
          } catch (err) {
            console.error('Error saving profile photo:', err)
          }
          return updated
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfilePhotoRemove = (e) => {
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
  }

  // Template cards definition matching Screenshot 2
  const templates = [
    {
      id: 'essential',
      name: 'Essential Pro',
      desc: 'Un classique moderne et équilibré qui fonctionne toujours',
      category: 'Professionnels',
      tags: ['Tous les modèles', 'Professionnels', 'Simples'],
      image: templateEssentialImg
    },
    {
      id: 'executive',
      name: 'Modern Executive',
      desc: 'Parfait pour les postes de management et direction',
      category: 'Professionnels',
      tags: ['Tous les modèles', 'Professionnels', 'Modernes'],
      image: templateExecutiveImg
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      desc: 'Idéal pour les designers, artistes et profils créatifs',
      category: 'Créatifs',
      tags: ['Tous les modèles', 'Créatifs', 'Modernes'],
      image: templateCreativeImg
    },
    {
      id: 'minimalist',
      name: 'Premium Minimalist',
      desc: 'Élégant, épuré et typographique haut de gamme',
      category: 'Modernes',
      tags: ['Tous les modèles', 'Modernes', 'Simples'],
      image: templateMinimalistImg
    },
    {
      id: 'academic',
      name: 'Academic Standard',
      desc: "Idéal pour l'enseignement, le droit et la recherche",
      category: 'Académiques',
      tags: ['Tous les modèles', 'Académiques', 'Simples'],
      image: templateAcademicImg
    },
    {
      id: 'tech',
      name: 'Tech Developer',
      desc: 'Optimisé pour développeurs, devops & ingénieurs tech',
      category: 'Modernes',
      tags: ['Tous les modèles', 'Modernes', 'Professionnels'],
      image: templateTechImg
    },
    {
      id: 'elegant',
      name: 'Élégant Prestige',
      desc: 'Design haute couture & finance aux teintes bordeaux et or',
      category: 'Professionnels',
      tags: ['Tous les modèles', 'Professionnels', 'Modernes'],
      image: templateElegantImg
    }
  ]

  const categories = ['Tous les modèles', 'Professionnels', 'Créatifs', 'Modernes', 'Simples', 'Académiques']

  const filteredTemplates = templates.filter(tmpl =>
    activeCategory === 'Tous les modèles' ? true : tmpl.tags.includes(activeCategory)
  )

  // Handle Form changes
  const handleFieldChange = (field, value) => {
    setCvData(prev => ({ ...prev, [field]: value }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Experience changes
  const handleExpChange = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      company: 'Nouvelle Entreprise',
      role: 'Poste occupé',
      startDate: '2023',
      endDate: 'Présent',
      description: 'Description de vos missions et réalisations...'
    }
    setCvData(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const removeExperience = (id) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(item => item.id !== id)
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Education changes
  const handleEduChange = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      degree: 'Diplôme / Formation',
      school: 'Université / École',
      years: '2020 — 2022'
    }
    setCvData(prev => ({ ...prev, education: [...prev.education, newEdu] }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const removeEducation = (id) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Skills
  const addSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      const trimmed = newSkillInput.trim()
      if (trimmed && !cvData.skills.includes(trimmed)) {
        setCvData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }))
        setNewSkillInput('')
        setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
      }
    }
  }

  const removeSkill = (skillToRemove) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Languages
  const handleLangChange = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(l =>
        l.id === id ? { ...l, [field]: value } : l
      )
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const addLanguage = () => {
    const newLang = {
      id: Date.now(),
      name: 'Nouvelle Langue',
      level: 'INTERMÉDIAIRE'
    }
    setCvData(prev => ({ ...prev, languages: [...prev.languages, newLang] }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const removeLanguage = (id) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.id !== id)
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Projects
  const handleProjectChange = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: 'Nouveau Projet',
      role: '',
      dates: '',
      description: '',
      link: ''
    }
    setCvData(prev => ({ ...prev, projects: [...(prev.projects || []), newProject] }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  const removeProject = (id) => {
    setCvData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter(p => p.id !== id)
    }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
  }

  // Handle Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCvData(prev => ({ ...prev, photoUrl: reader.result }))
        setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove CV photo
  const handleCvPhotoRemove = (e) => {
    e.stopPropagation()
    setCvData(prev => ({ ...prev, photoUrl: null }))
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }


  // Save changes (single CV) + generate thumbnail via html2canvas
  const saveChanges = async () => {
    try {
      setSavedStatus('ENREGISTREMENT...')
      let thumbnail = null
      if (resumePaperRef.current) {
        try {
          const canvas = await html2canvas(resumePaperRef.current, {
            scale: 0.4,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff'
          })
          thumbnail = canvas.toDataURL('image/jpeg', 0.75)
        } catch (thumbErr) {
          console.warn('Thumbnail capture failed:', thumbErr)
        }
      }

      const updatedCv = {
        ...cvData,
        id: activeCvId || cvData.id || Date.now(),
        templateId: selectedTemplate,
        templateName: templates.find(t => t.id === selectedTemplate)?.name || 'Essential Pro',
        lastModified: new Date().toISOString(),
        thumbnail
      }
      localStorage.setItem(`w4j_user_cv${userKey}`, JSON.stringify(updatedCv))
      setCvList(prev => {
        const exists = prev.find(c => c.id === updatedCv.id)
        const newList = exists
          ? prev.map(c => c.id === updatedCv.id ? updatedCv : c)
          : [...prev, updatedCv]
        localStorage.setItem(`w4j_user_cvs${userKey}`, JSON.stringify(newList))
        return newList
      })
      setActiveCvId(updatedCv.id)
      setSavedStatus('ENREGISTRÉ')
    } catch (err) {
      console.error('Error saving CV:', err)
      setSavedStatus('ERREUR')
    }
  }

  // Delete a CV from the list
  const deleteCv = (id) => {
    setCvList(prev => {
      const newList = prev.filter(c => c.id !== id)
      localStorage.setItem(`w4j_user_cvs${userKey}`, JSON.stringify(newList))
      return newList
    })
    setDeleteConfirmId(null)
  }

  // Open a CV for editing
  const openCvForEditing = (cv) => {
    setCvData(cv)
    setSelectedTemplate(cv.templateId || 'essential')
    setActiveCvId(cv.id)
    setSavedStatus('ENREGISTRÉ')
    setCurrentView('builder')
  }

  // Create new CV from template
  const createNewCv = (templateId) => {
    const tpl = templates.find(t => t.id === templateId) || templates[2]
    const newId = Date.now()
    const newCv = {
      ...defaultCvData,
      id: newId,
      title: `Nouveau CV - ${tpl.name}`,
      templateId: templateId,
      templateName: tpl.name,
      lastModified: new Date().toISOString()
    }
    setCvData(newCv)
    setSelectedTemplate(templateId)
    setActiveCvId(newId)
    setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
    setCurrentView('builder')
  }

  // ─────────────────────────────────────────────────────────────────
  // Export CV as PDF (works from list view AND builder view)
  // Renders ResumePaper into a hidden off-screen container, captures
  // with html2canvas at 2x, then saves a real PDF via jsPDF.
  // ─────────────────────────────────────────────────────────────────
  const exportCvAsPdf = async (cv) => {
    setPdfLoading(true)
    const filename = `${(cv.title || 'Mon CV').replace(/\.pdf$/i, '')}.pdf`

    // 1. Create temporary off-screen container
    const container = document.createElement('div')
    container.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      'width:794px',       // A4 at 96dpi
      'background:#ffffff',
      'z-index:-100',
      'pointer-events:none'
    ].join(';')
    document.body.appendChild(container)

    // 2. Render ResumePaper into the container
    const root = ReactDOM.createRoot(container)
    root.render(<ResumePaper cvData={cv} templateId={cv.templateId || 'essential'} />)

    // 3. Wait for React to paint + any images to load
    await new Promise(resolve => setTimeout(resolve, 700))

    try {
      // 4. Capture with html2canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794
      })

      // 5. Build PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.97)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(filename)
    } catch (err) {
      console.error('PDF export error:', err)
      alert('L\'export PDF a échoué. Veuillez réessayer.')
    } finally {
      // 6. Clean up
      root.unmount()
      document.body.removeChild(container)
      setPdfLoading(false)
    }
  }

  // Download PDF from builder view (uses live preview ref for speed)
  const handleDownloadPdf = async () => {
    if (resumePaperRef.current) {
      // Fast path: capture the already-rendered preview column
      setPdfLoading(true)
      try {
        const canvas = await html2canvas(resumePaperRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.97)
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
        pdf.save(`${(cvData.title || 'Mon CV').replace(/\.pdf$/i, '')}.pdf`)
      } catch (err) {
        console.error('PDF builder export error:', err)
        // Fallback to the generic path
        await exportCvAsPdf(cvData)
      } finally {
        setPdfLoading(false)
      }
    } else {
      // Fallback: use the generic off-screen renderer
      await exportCvAsPdf(cvData)
    }
  }

  // Format date in French
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    try {
      return new Date(isoString).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    } catch { return 'N/A' }
  }

  // Relative time in French ("IL Y A 2H", "3 JOURS", etc.)
  const timeAgo = (isoString) => {
    if (!isoString) return ''
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'À L\'INSTANT'
      if (diffMin < 60) return `IL Y A ${diffMin} MIN`
      const diffH = Math.floor(diffMin / 60)
      if (diffH < 24) return `IL Y A ${diffH}H`
      const diffD = Math.floor(diffH / 24)
      if (diffD === 1) return '1 JOUR'
      return `${diffD} JOURS`
    } catch { return '' }
  }

  // Template badge color palette
  const templateBadgeColor = {
    essential: { bg: '#f3e8ff', color: '#6b21a8', label: 'ESSENTIEL' },
    executive: { bg: '#e8f4fd', color: '#1a6fa6', label: 'EXECUTIVE' },
    creative:  { bg: '#fff3e0', color: '#c75a00', label: 'CRÉATIF' },
    minimalist:{ bg: '#f3f4f6', color: '#1f2937', label: 'MINIMALISTE' },
    academic:  { bg: '#ecfdf5', color: '#065f46', label: 'ACADÉMIQUE' },
    tech:      { bg: '#ecfeff', color: '#0e7490', label: 'TECH' },
    elegant:   { bg: '#fdf2f8', color: '#9d174d', label: 'ÉLÉGANT' }
  }

  return (
    <div className="ud-container">
      {/* ====================================================================
          LEFT SIDEBAR (VIOLET W4J)
          ==================================================================== */}
      <aside className="ud-sidebar">
        {/* Brand Logo with logo-light.png */}
        <div className="ud-logo-area" onClick={() => setCurrentView('welcome')} title="Web4Jobs - Accueil">
          <img src={logoLightImg} alt="Web4Jobs" className="ud-sidebar-logo-img" />
        </div>

        {/* Navigation Icons */}
        <nav className="ud-nav-list">
          {/* Home / Dashboard icon */}
          <button
            className={`ud-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
            title="Tableau de bord"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>

          {/* Mes CV icon */}
          <button
            className={`ud-nav-item ${currentView === 'my-cvs' ? 'active' : ''}`}
            onClick={() => setCurrentView('my-cvs')}
            title="Mes CV"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {cvList.length > 0 && (
              <span className="ud-nav-badge">{cvList.length}</span>
            )}
          </button>

          {/* Modèles (Layers) icon */}
          <button
            className={`ud-nav-item ${currentView === 'templates' ? 'active' : ''}`}
            onClick={() => setCurrentView('templates')}
            title="Choisir un modèle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>

          <div className="ud-nav-divider" />

          {/* Profile / Settings icon matching Screenshot */}
          <button
            className={`ud-nav-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
            title="Paramètres du profil"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </nav>

        {/* Sidebar Bottom: Logout */}
        <div className="ud-sidebar-bottom">
          <button
            className="ud-nav-item"
            onClick={() => onLogout && onLogout()}
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
          MAIN CONTENT
          ==================================================================== */}
      <main className="ud-main">
        {/* Fallback: redirect legacy states */}
        {currentView === 'welcome' && (() => { setTimeout(() => setCurrentView('dashboard'), 0); return null })()}

        {/* ====================================================
            VIEW 1: DASHBOARD (Accueil)
            ==================================================== */}
        {currentView === 'dashboard' && (
          <>
            <header className="ud-topbar">
              <div className="ud-topbar-left">
                <span className="ud-topbar-title">Tableau de bord</span>
              </div>
              <div className="ud-topbar-right">
                <button
                  className="ud-btn-create-cv"
                  onClick={() => setCurrentView('templates')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Nouveau CV
                </button>
                {profileData.photoUrl ? (
                  <img src={profileData.photoUrl} alt="Profil" className="ud-topbar-avatar" onClick={() => setCurrentView('profile')} title="Paramètres du profil" />
                ) : (
                  <div className="ud-topbar-avatar-empty" onClick={() => setCurrentView('profile')} title="Paramètres du profil">
                    {((profileData.firstName?.[0] || 'U') + (profileData.lastName?.[0] || '')).toUpperCase()}
                  </div>
                )}
              </div>
            </header>

            <div className="ud-mycvs-view">
              {/* Welcome */}
              <div className="ud-dashboard-welcome">
                <div className="ud-welcome-text">
                  <h1 className="ud-welcome-title">Bienvenue, {profileData.firstName || profileData.name || 'Utilisateur'} 👋</h1>
                  <p className="ud-welcome-subtitle">Créez et gérez vos CV professionnels facilement.</p>
                </div>
                <div className="ud-welcome-stats">
                  <div className="ud-stat-card">
                    <span className="ud-stat-num">{cvList.length}</span>
                    <span className="ud-stat-label">CV créé{cvList.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="ud-dashboard-cta">
                <button className="ud-btn-create-main" onClick={() => setCurrentView('templates')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Créer un nouveau CV
                </button>
              </div>

              {cvList.length === 0 ? (
                /* Empty state */
                <div className="ud-empty-state">
                  <div className="ud-empty-state-illustration">
                    <div className="ud-empty-doc-stack">
                      <div className="ud-empty-doc ud-empty-doc-back"></div>
                      <div className="ud-empty-doc ud-empty-doc-mid"></div>
                      <div className="ud-empty-doc ud-empty-doc-front">
                        <div className="ud-empty-doc-lines">
                          <div className="ud-empty-line" style={{ width: '60%' }}></div>
                          <div className="ud-empty-line" style={{ width: '40%' }}></div>
                          <div className="ud-empty-line" style={{ width: '80%', marginTop: '12px' }}></div>
                          <div className="ud-empty-line" style={{ width: '70%' }}></div>
                          <div className="ud-empty-line" style={{ width: '55%' }}></div>
                        </div>
                        <div className="ud-empty-doc-plus">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h2 className="ud-empty-title">Vous n'avez encore créé aucun CV.</h2>
                  <p className="ud-empty-desc">Créez votre premier CV professionnel en quelques étapes simples.</p>
                  <button className="ud-btn-create-first" onClick={() => setCurrentView('templates')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Créer mon premier CV
                  </button>
                  {onSwitchRole && (
                    <div style={{ marginTop: '32px' }}>
                      <button onClick={() => onSwitchRole('admin')} style={{ background: 'none', border: '1px dashed #d1d5db', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', color: '#9ca3af', cursor: 'pointer' }}>
                        Basculer vers la vue Administrateur
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Recent CVs preview */
                <div className="ud-recent-cvs-section">
                  <div className="ud-section-header">
                    <h2 className="ud-section-title">Mes CV récents</h2>
                    <button className="ud-voir-tous-btn" onClick={() => setCurrentView('my-cvs')}>
                      Voir tous mes CV
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <div className="ud-cv-list">
                    {cvList.slice(0, 3).map((cv) => {
                      const tpl = templates.find(t => t.id === cv.templateId)
                      return (
                        <div key={cv.id} className="ud-cv-list-item">
                          <div className="ud-cv-list-thumb">
                            {cv.thumbnail ? <img src={cv.thumbnail} alt={cv.title} />
                              : tpl?.image ? <img src={tpl.image} alt={tpl.name} style={{ opacity: 0.55 }} />
                              : <div className="ud-cv-list-thumb-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
                            }
                          </div>
                          <div className="ud-cv-list-info">
                            <h3 className="ud-cv-list-title">{cv.title || 'Mon CV'}</h3>
                            <p className="ud-cv-list-meta">
                              <span>Modèle : {tpl?.name || 'Classique'}</span>
                              <span className="ud-cv-list-dot">•</span>
                              <span>Dernière modification : {formatDate(cv.lastModified)}</span>
                            </p>
                          </div>
                          <div className="ud-cv-list-actions">
                            <button className="ud-list-action-btn ud-list-btn-edit" onClick={() => openCvForEditing(cv)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              Modifier
                            </button>
                            <button className="ud-list-action-btn ud-list-btn-preview" onClick={() => { setCvData(cv); setSelectedTemplate(cv.templateId || 'essential'); setShowPreviewModal(true) }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              Aperçu
                            </button>
                            <button className="ud-list-action-btn ud-list-btn-pdf" onClick={() => exportCvAsPdf(cv)} disabled={pdfLoading}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                              Télécharger PDF
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {cvList.length > 3 && (
                    <div className="ud-voir-plus-wrap">
                      <button className="ud-voir-plus-btn" onClick={() => setCurrentView('my-cvs')}>
                        Voir tous ({cvList.length}) CV
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ====================================================
            VIEW 2: MES CV (Liste complète)
            ==================================================== */}
        {currentView === 'my-cvs' && (
          <>
            <header className="ud-topbar">
              <div className="ud-topbar-left">
                <span className="ud-topbar-title">Mes CV</span>
                {cvList.length > 0 && (
                  <span className="ud-cv-count-badge">{cvList.length} CV{cvList.length > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="ud-topbar-right">
                <button className="ud-btn-create-cv" onClick={() => setCurrentView('templates')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Nouveau CV
                </button>
                {profileData.photoUrl ? (
                  <img src={profileData.photoUrl} alt="Profil" className="ud-topbar-avatar" onClick={() => setCurrentView('profile')} title="Paramètres du profil" />
                ) : (
                  <div className="ud-topbar-avatar-empty" onClick={() => setCurrentView('profile')} title="Paramètres du profil">
                    {((profileData.firstName?.[0] || 'U') + (profileData.lastName?.[0] || '')).toUpperCase()}
                  </div>
                )}
              </div>
            </header>

            <div className="ud-mycvs-view ud-mycvs-grid-view">
              {cvList.length === 0 ? (
                /* Empty state — grid with only the create card */
                <div className="ud-cvgrid">
                  {/* Create new CV card */}
                  <div className="ud-cvcard ud-cvcard-create" onClick={() => setCurrentView('templates')}>
                    <div className="ud-cvcard-create-inner">
                      <div className="ud-cvcard-create-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <p className="ud-cvcard-create-label">CRÉER UN NOUVEAU<br/>CV</p>
                      <p className="ud-cvcard-create-hint">Choisissez un modèle et lancez-vous.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid of CV cards */
                <div className="ud-cvgrid">
                  {cvList.map((cv) => {
                    const tpl = templates.find(t => t.id === cv.templateId)
                    const badge = templateBadgeColor[cv.templateId] || { bg: '#f3e8ff', color: '#6b21a8', label: 'MODÈLE' }
                    return (
                      <div key={cv.id} className="ud-cvcard">


                        {/* Thumbnail */}
                        <div className="ud-cvcard-thumb" onClick={() => openCvForEditing(cv)}>
                          {cv.thumbnail ? (
                            <img src={cv.thumbnail} alt={cv.title} />
                          ) : tpl?.image ? (
                            <img src={tpl.image} alt={tpl.name} style={{ opacity: 0.7 }} />
                          ) : (
                            <div className="ud-cvcard-thumb-placeholder">
                              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info row */}
                        <div className="ud-cvcard-info">
                          <h3 className="ud-cvcard-title" onClick={() => openCvForEditing(cv)}>
                            {cv.title?.replace(/\.pdf$/i, '') || 'Mon CV'}
                          </h3>
                          <span
                            className="ud-cvcard-badge"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            MODÈLE : {badge.label}
                          </span>
                        </div>

                        {/* Footer row: time + action buttons */}
                        <div className="ud-cvcard-footer-meta">
                          <span className="ud-cvcard-time">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {timeAgo(cv.lastModified)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="ud-cvcard-actions">
                          {/* Modifier */}
                          <button
                            className="ud-cvcard-action-btn ud-cvcard-btn-edit"
                            title="Modifier"
                            onClick={() => openCvForEditing(cv)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Modifier
                          </button>

                          {/* Aperçu */}
                          <button
                            className="ud-cvcard-action-btn ud-cvcard-btn-preview"
                            title="Aperçu"
                            onClick={() => { setCvData(cv); setSelectedTemplate(cv.templateId || 'essential'); setShowPreviewModal(true) }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Aperçu
                          </button>

                          {/* Télécharger PDF */}
                          <button
                            className="ud-cvcard-action-btn ud-cvcard-btn-pdf"
                            title="Télécharger PDF"
                            disabled={pdfLoading}
                            onClick={() => exportCvAsPdf(cv)}
                          >
                            {pdfLoading ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" /></svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            )}
                            PDF
                          </button>

                          {/* Supprimer */}
                          <button
                            className="ud-cvcard-action-btn ud-cvcard-btn-delete"
                            title="Supprimer"
                            onClick={e => { e.stopPropagation(); setDeleteConfirmId(cv.id) }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    )
                  })}

                  {/* Create new CV card — always last */}
                  <div className="ud-cvcard ud-cvcard-create" onClick={() => setCurrentView('templates')}>
                    <div className="ud-cvcard-create-inner">
                      <div className="ud-cvcard-create-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <p className="ud-cvcard-create-label">CRÉER UN NOUVEAU<br/>CV</p>
                      <p className="ud-cvcard-create-hint">Choisissez un modèle et lancez-vous.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirmId && (
              <div className="ud-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
                <div className="ud-delete-modal" onClick={e => e.stopPropagation()}>
                  <div className="ud-delete-modal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </div>
                  <h3 className="ud-delete-modal-title">Supprimer ce CV ?</h3>
                  <p className="ud-delete-modal-desc">Cette action est irréversible. Le CV sera définitivement supprimé.</p>
                  <div className="ud-delete-modal-actions">
                    <button className="ud-delete-modal-cancel" onClick={() => setDeleteConfirmId(null)}>Annuler</button>
                    <button className="ud-delete-modal-confirm" onClick={() => deleteCv(deleteConfirmId)}>Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: TEMPLATE SELECTOR (SCREEN 2) */}
        {currentView === 'templates' && (
          <>
            <header className="ud-topbar">
              <span className="ud-topbar-title">Choisissez un modèle</span>
              <div className="ud-topbar-right">
                <button className="ud-cancel-btn" onClick={() => setCurrentView('my-cvs')}>
                  Annuler
                </button>
              </div>
            </header>

            <div className="ud-templates-view">
              {/* Category Filter Pills */}
              <div className="ud-filters-row">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`ud-filter-pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="ud-templates-grid">
                {filteredTemplates.map((template) => (
                  <article
                    key={template.id}
                    className="ud-template-card"
                    onClick={() => {
                      createNewCv(template.id)
                    }}
                  >
                    <div className="ud-template-card-preview">
                      <img src={template.image} alt={template.name} />
                      <span className="ud-template-card-badge">ATS</span>
                    </div>
                    <div className="ud-template-card-info">
                      <h3 className="ud-template-card-title">{template.name}</h3>
                      <p className="ud-template-card-desc">{template.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}

        {/* VIEW 3: BUILDER / EDITOR + LIVE PREVIEW (SCREEN 3) */}
        {currentView === 'builder' && (
          <>
            <header className="ud-topbar">
              <div className="ud-builder-header-left">
                <button
                  className="ud-back-btn"
                  onClick={() => setCurrentView('my-cvs')}
                  title="Retour à mes CV"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>

                <input
                  type="text"
                  className="ud-doc-title-input"
                  value={cvData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  title="Cliquez pour renommer"
                />

                <span className="ud-status-badge">{savedStatus}</span>
              </div>

              <div className="ud-builder-actions">
                <div className="ud-topbar-template-picker">
                  <select
                    className="ud-topbar-picker-select"
                    value={selectedTemplate}
                    onChange={(e) => {
                      const newTpl = e.target.value
                      setSelectedTemplate(newTpl)
                      setCvData(prev => ({
                        ...prev,
                        templateId: newTpl,
                        templateName: templates.find(t => t.id === newTpl)?.name || 'Modèle'
                      }))
                      setSavedStatus('MODIFICATIONS NON ENREGISTRÉES')
                    }}
                    title="Changer de modèle de design"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>Modèle : {t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="ud-btn-preview"
                  onClick={() => setShowPreviewModal(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Aperçu
                </button>

                <button
                  className="ud-btn-download"
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  style={{ opacity: pdfLoading ? 0.7 : 1 }}
                >
                  {pdfLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                      </svg>
                      Génération...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Télécharger PDF
                    </>
                  )}
                </button>
              </div>
            </header>

            <div className="ud-builder-workspace">
              {/* LEFT FORM COLUMN */}
              <div className="ud-editor-col">
                {/* 1. Informations personnelles */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">1</span>
                      <h2 className="ud-section-title">Informations personnelles</h2>
                    </div>
                  </div>

                  {/* Photo de profil */}
                  <div className="ud-photo-row">
                    <div
                      className="ud-photo-avatar-box"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      title={cvData.photoUrl ? "Changer de photo" : "Ajouter une photo"}
                    >
                      {cvData.photoUrl ? (
                        <img src={cvData.photoUrl} alt="Photo" />
                      ) : (
                        <div className="ud-photo-empty-placeholder">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                      <span className="ud-camera-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </span>
                      {/* Remove photo button — only shown when photo is set */}
                      {cvData.photoUrl && (
                        <button
                          className="ud-photo-remove-btn"
                          onClick={handleCvPhotoRemove}
                          title="Supprimer la photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <div className="ud-photo-meta">
                      <b>Photo de profil</b>
                      <small>Format JPG, PNG ou GIF. Taille max 2MB.</small>
                    </div>
                  </div>

                  {/* Prénom & Nom */}
                  <div className="ud-fields-grid-2">
                    <div className="ud-field">
                      <label>PRÉNOM</label>
                      <input
                        type="text"
                        className="ud-input"
                        value={cvData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="ud-field">
                      <label>NOM</label>
                      <input
                        type="text"
                        className="ud-input"
                        value={cvData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Titre du poste */}
                  <div className="ud-field">
                    <label>TITRE DU POSTE</label>
                    <input
                      type="text"
                      className="ud-input"
                      value={cvData.jobTitle}
                      onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                    />
                  </div>

                  {/* Coordonnées */}
                  <div className="ud-fields-grid-2">
                    <div className="ud-field">
                      <label>EMAIL</label>
                      <input
                        type="email"
                        className="ud-input"
                        value={cvData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                      />
                    </div>
                    <div className="ud-field">
                      <label>TÉLÉPHONE</label>
                      <input
                        type="text"
                        className="ud-input"
                        value={cvData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ud-field">
                    <label>VILLE / ADRESSE</label>
                    <input
                      type="text"
                      className="ud-input"
                      value={cvData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                    />
                  </div>
                </section>

                {/* 2. Expérience professionnelle */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">2</span>
                      <h2 className="ud-section-title">Expérience professionnelle</h2>
                    </div>
                    <button className="ud-btn-add" onClick={addExperience}>
                      + AJOUTER
                    </button>
                  </div>

                  {cvData.experiences.map((exp) => (
                    <div key={exp.id} className="ud-entry-card">
                      <div className="ud-entry-card-header">
                        <b>{exp.company || 'Nouvelle entreprise'}</b>
                        <button
                          className="ud-btn-remove"
                          onClick={() => removeExperience(exp.id)}
                          title="Supprimer cette expérience"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="ud-field">
                        <label>ENTREPRISE</label>
                        <input
                          type="text"
                          className="ud-input"
                          value={exp.company}
                          onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)}
                        />
                      </div>

                      <div className="ud-field">
                        <label>POSTE OCCUPÉ</label>
                        <input
                          type="text"
                          className="ud-input"
                          value={exp.role}
                          onChange={(e) => handleExpChange(exp.id, 'role', e.target.value)}
                        />
                      </div>

                      <div className="ud-fields-grid-2">
                        <div className="ud-field">
                          <label>DÉBUT</label>
                          <input
                            type="text"
                            className="ud-input"
                            value={exp.startDate}
                            onChange={(e) => handleExpChange(exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="ud-field">
                          <label>FIN</label>
                          <input
                            type="text"
                            className="ud-input"
                            value={exp.endDate}
                            onChange={(e) => handleExpChange(exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="ud-field">
                        <label>DESCRIPTION</label>
                        <textarea
                          className="ud-textarea"
                          value={exp.description}
                          onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                {/* 3. Éducation */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">3</span>
                      <h2 className="ud-section-title">Éducation</h2>
                    </div>
                    <button className="ud-btn-add" onClick={addEducation}>
                      + AJOUTER
                    </button>
                  </div>

                  {cvData.education.map((edu) => (
                    <div key={edu.id} className="ud-entry-card">
                      <div className="ud-entry-card-header">
                        <b>{edu.degree || 'Nouveau diplôme'}</b>
                        <button
                          className="ud-btn-remove"
                          onClick={() => removeEducation(edu.id)}
                          title="Supprimer cette formation"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="ud-field">
                        <label>DIPLÔME / FORMATION</label>
                        <input
                          type="text"
                          className="ud-input"
                          value={edu.degree}
                          onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)}
                        />
                      </div>

                      <div className="ud-field">
                        <label>ÉCOLE / UNIVERSITÉ</label>
                        <input
                          type="text"
                          className="ud-input"
                          value={edu.school}
                          onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)}
                        />
                      </div>

                      <div className="ud-field">
                        <label>ANNÉES</label>
                        <input
                          type="text"
                          className="ud-input"
                          value={edu.years}
                          onChange={(e) => handleEduChange(edu.id, 'years', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                {/* 4. Projets */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">4</span>
                      <h2 className="ud-section-title">Projets</h2>
                    </div>
                    <button className="ud-btn-add" onClick={addProject}>
                      + AJOUTER
                    </button>
                  </div>

                  {(cvData.projects || []).length === 0 && (
                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: '4px 0 12px 0' }}>
                      Aucun projet ajouté. Cliquez sur "+ AJOUTER" pour renseigner vos projets académiques, personnels ou professionnels.
                    </p>
                  )}

                  {(cvData.projects || []).map((proj) => (
                    <div key={proj.id} className="ud-entry-card">
                      <div className="ud-entry-card-header">
                        <b>{proj.name || 'Nouveau projet'}</b>
                        <button
                          className="ud-btn-remove"
                          onClick={() => removeProject(proj.id)}
                          title="Supprimer ce projet"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="ud-field">
                        <label>NOM DU PROJET *</label>
                        <input
                          type="text"
                          className="ud-input"
                          placeholder="ex: Application Web SaaS, Projet de Fin d'Études, Portfolio..."
                          value={proj.name}
                          onChange={(e) => handleProjectChange(proj.id, 'name', e.target.value)}
                        />
                      </div>

                      <div className="ud-fields-grid-2">
                        <div className="ud-field">
                          <label>RÔLE (FACULTATIF)</label>
                          <input
                            type="text"
                            className="ud-input"
                            placeholder="ex: Lead Developer, Créateur, Chercheur..."
                            value={proj.role || ''}
                            onChange={(e) => handleProjectChange(proj.id, 'role', e.target.value)}
                          />
                        </div>

                        <div className="ud-field">
                          <label>DATES (FACULTATIF)</label>
                          <input
                            type="text"
                            className="ud-input"
                            placeholder="ex: 2023, Jan 2023 — Présent..."
                            value={proj.dates || ''}
                            onChange={(e) => handleProjectChange(proj.id, 'dates', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="ud-field">
                        <label>LIEN DU PROJET (FACULTATIF)</label>
                        <input
                          type="url"
                          className="ud-input"
                          placeholder="ex: https://github.com/... ou https://monprojet.fr"
                          value={proj.link || ''}
                          onChange={(e) => handleProjectChange(proj.id, 'link', e.target.value)}
                        />
                      </div>

                      <div className="ud-field">
                        <label>DESCRIPTION DU PROJET</label>
                        <textarea
                          className="ud-textarea"
                          rows={3}
                          placeholder="Objectifs, architecture technique, fonctionnalités clés et impact..."
                          value={proj.description || ''}
                          onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                {/* 5. Compétences */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">5</span>
                      <h2 className="ud-section-title">Compétences</h2>
                    </div>
                  </div>

                  <div className="ud-tags-wrap">
                    {cvData.skills.map((skill) => (
                      <span key={skill} className="ud-tag-pill">
                        {skill}
                        <button
                          type="button"
                          className="ud-tag-remove"
                          onClick={() => removeSkill(skill)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="ud-field" style={{ flexDirection: 'row', gap: '8px' }}>
                    <input
                      type="text"
                      className="ud-input"
                      placeholder="Ajouter une compétence (ex: Docker)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                    />
                    <button
                      type="button"
                      className="ud-btn-download"
                      style={{ padding: '0 16px', borderRadius: '9px', fontSize: '12px' }}
                      onClick={addSkill}
                    >
                      Ajouter
                    </button>
                  </div>
                </section>

                {/* 6. Langues */}
                <section className="ud-form-section">
                  <div className="ud-section-header">
                    <div className="ud-section-title-wrap">
                      <span className="ud-section-number">6</span>
                      <h2 className="ud-section-title">Langues</h2>
                    </div>
                    <button className="ud-btn-add" onClick={addLanguage}>
                      + AJOUTER
                    </button>
                  </div>

                  {cvData.languages.map((lang) => (
                    <div key={lang.id} className="ud-entry-card">
                      <div className="ud-entry-card-header">
                        <b>{lang.name}</b>
                        <button
                          className="ud-btn-remove"
                          onClick={() => removeLanguage(lang.id)}
                          title="Supprimer cette langue"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="ud-fields-grid-2">
                        <div className="ud-field">
                          <label>LANGUE</label>
                          <input
                            type="text"
                            className="ud-input"
                            value={lang.name}
                            onChange={(e) => handleLangChange(lang.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="ud-field">
                          <label>NIVEAU</label>
                          <input
                            type="text"
                            className="ud-input"
                            value={lang.level}
                            placeholder="ex: NATIF, AVANCÉ, B2..."
                            onChange={(e) => handleLangChange(lang.id, 'level', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Fixed Save Button */}
                <div className="ud-sticky-footer">
                  <button className="ud-btn-save-changes" onClick={saveChanges}>
                    ENREGISTRER LES MODIFICATIONS
                  </button>
                </div>
              </div>

              {/* RIGHT LIVE PREVIEW COLUMN */}
              <div className="ud-preview-col">
                <ResumePaper cvData={cvData} templateId={selectedTemplate} ref={resumePaperRef} />
              </div>
            </div>
          </>
        )}

        {/* VIEW 4: PROFILE SETTINGS ("Paramètres du profil") */}
        {currentView === 'profile' && (
          <>
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
                      onClick={handleProfilePhotoRemove}
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
                    onChange={handleProfilePhotoUpload}
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

              {/* Two-column layout */}
              <div className="ud-profile-grid">
                {/* Left Sidebar Column */}
                <div className="ud-profile-sidebar-col">
                  {/* Navigation Tabs Card */}
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

                {/* Right Content Column */}
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
                              onChange={(e) => handleProfileFieldChange('firstName', e.target.value)}
                            />
                          </div>
                          <div className="ud-profile-field-group">
                            <label className="ud-profile-field-label">NOM</label>
                            <input
                              type="text"
                              className="ud-profile-input"
                              value={profileData.lastName}
                              onChange={(e) => handleProfileFieldChange('lastName', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="ud-profile-field-group">
                          <label className="ud-profile-field-label">ADRESSE E-MAIL</label>
                          <input
                            type="email"
                            className="ud-profile-input"
                            value={profileData.email}
                            onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                          />
                        </div>

                        <div className="ud-profile-field-group">
                          <label className="ud-profile-field-label">EXPERTISE / TITRE DE POSTE</label>
                          <input
                            type="text"
                            className="ud-profile-input"
                            placeholder="ex : Développeur Fullstack, Designer UI/UX..."
                            value={profileData.jobTitle || ''}
                            onChange={(e) => handleProfileFieldChange('jobTitle', e.target.value)}
                          />
                        </div>

                        <div className="ud-profile-field-group" style={{ marginBottom: 0 }}>
                          <label className="ud-profile-field-label">BIO COURTE</label>
                          <textarea
                            className="ud-profile-textarea"
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
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
                              onChange={(e) => handleProfileFieldChange('country', e.target.value)}
                            />
                          </div>
                          <div className="ud-profile-field-group" style={{ marginBottom: 0 }}>
                            <label className="ud-profile-field-label">LANGUE DE L'INTERFACE</label>
                            <input
                              type="text"
                              className="ud-profile-input"
                              value={profileData.language}
                              onChange={(e) => handleProfileFieldChange('language', e.target.value)}
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
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                              localStorage.removeItem(`w4j_user_profile${userKey}`)
                              localStorage.removeItem(`w4j_user_cv${userKey}`)
                              localStorage.removeItem(`w4j_user_cvs${userKey}`)
                              alert('Compte supprimé avec succès.')
                              if (onLogout) onLogout()
                            }
                          }}
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
          </>
        )}

        {/* FULLSCREEN PREVIEW MODAL */}
        {showPreviewModal && (
          <div className="ud-modal-overlay" onClick={() => setShowPreviewModal(false)}>
            <div className="ud-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="ud-modal-close"
                onClick={() => setShowPreviewModal(false)}
                title="Fermer"
              >
                ✕
              </button>
              <ResumePaper cvData={cvData} templateId={selectedTemplate} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ============================================================================
// RESUME A4 PAPER COMPONENT - dynamically renders selected template design
// ============================================================================
const ResumePaper = React.forwardRef(function ResumePaper({ cvData, templateId }, ref) {
  const currentTplId = templateId || cvData?.templateId || 'essential'
  return <RenderCvTemplate templateId={currentTplId} cvData={cvData} innerRef={ref} />
})

