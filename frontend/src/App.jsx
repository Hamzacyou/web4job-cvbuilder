import { useState } from 'react'
import './App.css'
import web4jobLogo from './assets/web4job.png'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

function App() {
  const [page, setPage] = useState('signin')
  const [role, setRole] = useState('user')
  const [loginError, setLoginError] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registeredUser, setRegisteredUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('resumeflow-user'))
    } catch {
      return null
    }
  })

  const openDashboard = (selectedRole) => {
    setRole(selectedRole)
    setPage('dashboard')
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('resumeflow-user')
    } catch {}
    setRegisteredUser(null)
    setLoginError('')
    setRegistrationMessage('')
    setRole('user')
    setPage('signin')
  }

  if (page === 'dashboard') {
    return <Dashboard role={role} onNavigate={setPage} onSwitchRole={openDashboard} registeredUser={registeredUser} onUpdateUser={setRegisteredUser} onLogout={handleLogout} />
  }

  return (
    <AuthPage
      mode={page}
      onModeChange={(newPage) => {
        setLoginError('')
        setRegistrationMessage('')
        setPage(newPage)
      }}
      loginError={loginError}
      registrationMessage={registrationMessage}
      onQuickDashboard={openDashboard}
      onSubmit={(credentials) => {
        if (page === 'signup') {
          const pass = (credentials.password || '')
          if (!pass || pass.length < 8) {
            setLoginError('Le mot de passe doit comporter au moins 8 caractères.')
            return
          }

          const emailClean = (credentials.email || '').trim().toLowerCase()
          const signupKey = `_${emailClean}`

          const user = {
            firstName: credentials.firstName?.trim() || '',
            lastName: credentials.lastName?.trim() || '',
            name: `${credentials.firstName || ''} ${credentials.lastName || ''}`.trim(),
            email: emailClean,
            password: credentials.password,
            expertise: credentials.expertise?.trim() || ''
          }

          // Save user in multi-user records
          try {
            if (emailClean) {
              localStorage.setItem(`w4j_user_account_${emailClean}`, JSON.stringify(user))
              const list = JSON.parse(localStorage.getItem('w4j_registered_users')) || []
              const idx = list.findIndex(u => (u.email || '').trim().toLowerCase() === emailClean)
              if (idx >= 0) list[idx] = user
              else list.push(user)
              localStorage.setItem('w4j_registered_users', JSON.stringify(list))
            }
          } catch {}

          // Initialize fresh profile and CV specifically for this user
          const newProfile = {
            firstName: user.firstName,
            lastName: user.lastName,
            jobTitle: user.expertise || '',
            location: '',
            email: user.email,
            bio: '',
            country: 'France',
            language: 'Français',
            photoUrl: null,
            verified: true,
            plan: 'Plan Pro'
          }
          localStorage.setItem(`w4j_user_profile${signupKey}`, JSON.stringify(newProfile))

          const newCv = {
            title: `${user.expertise || 'Mon CV'}.pdf`,
            firstName: user.firstName,
            lastName: user.lastName,
            jobTitle: user.expertise || '',
            email: user.email,
            phone: '',
            location: '',
            photoUrl: null,
            experiences: [],
            education: [],
            projects: [],
            skills: user.expertise ? [user.expertise] : [],
            languages: [{ id: 1, name: 'Français', level: 'NATIF' }]
          }
          localStorage.setItem(`w4j_user_cv${signupKey}`, JSON.stringify(newCv))

          // Initialize an empty CVs list for this newly registered user
          localStorage.setItem(`w4j_user_cvs${signupKey}`, JSON.stringify([]))

          // Reset registeredUser in memory so previous session is completely gone
          try {
            localStorage.removeItem('resumeflow-user')
          } catch {}
          setRegisteredUser(null)
          setLoginError('')
          setRegistrationMessage('Inscription réussie ! Vous pouvez maintenant vous connecter avec vos identifiants.')
          setPage('signin')
          return
        }

        const inputEmail = (credentials.email || '').trim().toLowerCase()
        const inputPassword = credentials.password || ''

        const matchesAdmin = (inputEmail === 'admin' || credentials.email === 'admin') && inputPassword === 'admin'

        // Always reload freshly from localStorage to ensure newly changed password is recognized
        let storedUser = null
        try {
          storedUser = JSON.parse(localStorage.getItem('resumeflow-user'))
        } catch {}

        let scopedUser = null
        if (inputEmail) {
          try {
            scopedUser = JSON.parse(localStorage.getItem(`w4j_user_account_${inputEmail}`))
          } catch {}
        }

        let userList = []
        try {
          userList = JSON.parse(localStorage.getItem('w4j_registered_users')) || []
        } catch {}

        let matchedUser = null
        if (storedUser && (storedUser.email?.trim().toLowerCase() === inputEmail || storedUser.email === credentials.email) && storedUser.password === inputPassword) {
          matchedUser = storedUser
        } else if (scopedUser && scopedUser.password === inputPassword) {
          matchedUser = scopedUser
        } else {
          matchedUser = userList.find(u => 
            (u.email?.trim().toLowerCase() === inputEmail || u.email === credentials.email) &&
            u.password === inputPassword
          )
        }

        // Fallback to in-memory registeredUser if matched
        if (!matchedUser && registeredUser && 
            (registeredUser.email?.trim().toLowerCase() === inputEmail || registeredUser.email === credentials.email) && 
            registeredUser.password === inputPassword) {
          matchedUser = registeredUser
        }

        if (!matchesAdmin && !matchedUser) {
          setLoginError('Identifiant ou mot de passe incorrect.')
          return
        }

        setLoginError('')
        setRegistrationMessage('')
        if (matchedUser) {
          setRegisteredUser(matchedUser)
          localStorage.setItem('resumeflow-user', JSON.stringify(matchedUser))
        }
        openDashboard(matchedUser ? 'user' : 'admin')
      }}
    />
  )
}

function Brand() {
  return <div className="brand"><img src={web4jobLogo} alt="Web4Jobs" style={{ display: 'block', width: '220px', maxHeight: '74px', objectFit: 'contain', objectPosition: 'left center' }} /></div>
}

function AuthPage({ mode, onModeChange, onSubmit, loginError, registrationMessage, onQuickDashboard }) {
  const isSignup = mode === 'signup'
  return (
    <main className={`auth-page ${isSignup ? 'signup-page' : ''}`}>
      <section className="auth-panel" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Brand />
        <div className="auth-heading">
          <h1>{isSignup ? 'JOIN WEB4JOBS CV BUILDER' : 'WELCOME BACK'}</h1>
          <p>{isSignup ? 'Create your free account and start building your career today.' : 'Please enter your details to log in to your account.'}</p>
        </div>
        <form className="auth-form" onSubmit={(event) => {
          event.preventDefault()
          onSubmit({
            firstName: event.currentTarget.firstName?.value || '',
            lastName: event.currentTarget.lastName?.value || '',
            email: event.currentTarget.email?.value || '',
            password: event.currentTarget.password?.value || '',
            expertise: event.currentTarget.expertise?.value || ''
          })
        }}>
          {isSignup && <div className="field-row"><Field name="firstName" label="FIRST NAME" placeholder="John" /><Field name="lastName" label="LAST NAME" placeholder="Doe" /></div>}
          <Field name="email" label="EMAIL ADDRESS" placeholder={isSignup ? 'name@company.com' : 'name@company.com'} type="text" />
          <Field name="password" label="PASSWORD" placeholder={isSignup ? 'Au moins 8 caractères' : '••••••••••••'} type="password" minLength={isSignup ? 8 : undefined} />
          {isSignup && <Field name="expertise" label="EXPERTISE" placeholder="UI/UX Design" />}
          <button className="primary-button" type="submit">{isSignup ? 'CREATE FREE ACCOUNT' : 'LOG IN TO ACCOUNT'}</button>
        </form>

        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onQuickDashboard && onQuickDashboard('user')}
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: '9px',
              border: '1.5px solid #3e2675',
              background: '#f4effc',
              color: '#3e2675',
              fontWeight: '700',
              fontSize: '11px',
              cursor: 'pointer',
              letterSpacing: '0.4px',
              boxShadow: '0 2px 8px rgba(62, 38, 117, 0.12)'
            }}
          >
            ✦ DÉMO : ACCÉDER DIRECTEMENT AU DASHBOARD UTILISATEUR
          </button>
        </div>

        {loginError && <p className="login-error">{loginError}</p>}
        {registrationMessage && <p style={{ margin: '12px 0 -8px', color: '#129666', textAlign: 'center', fontSize: '10px', fontWeight: 700 }}>{registrationMessage}</p>}
        {isSignup ? <p className="legal">By clicking “Create Free Account”, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy.</a></p> : null}
        <p className="switch-copy">{isSignup ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={() => onModeChange(isSignup ? 'signin' : 'signup')}>{isSignup ? 'LOG IN HERE' : 'SIGN UP FOR FREE'}</button></p>
      </section>
      <section className="auth-hero">
        <div className="network-art"><i /><i /><i /><i /><i /><i /></div>
        <div className="hero-content">
          <span className="hero-pill">{isSignup ? 'JOIN 50K+ PROFESSIONALS' : 'CAREER BOOSTER V2.0'}</span>
          <h2>{isSignup ? <>ELEVATE YOUR<br />POTENTIAL.</> : <>YOUR<br />PROFESSIONAL<br />FUTURE STARTS<br />HERE.</>}</h2>
          <p>“ResumeFlow changed the way I present myself. Within two weeks, I had three interviews at top tech companies.”</p>
        </div>
      </section>
    </main>
  )
}

function Field({ name, label, placeholder, type = 'text', action, minLength }) {
  return (
    <label className="field">
      <span>{label}<em>{action}</em></span>
      <input name={name} type={type} placeholder={placeholder} minLength={minLength} required />
    </label>
  )
}

function Dashboard({ role, onNavigate, onSwitchRole, registeredUser, onUpdateUser, onLogout }) {
  if (role === 'user') {
    return (
      <UserDashboard
        key={registeredUser?.email ? `user_${registeredUser.email.trim().toLowerCase()}` : 'guest_session'}
        currentUser={registeredUser}
        onLogout={onLogout || (() => onNavigate('signin'))}
        onSwitchRole={onSwitchRole}
        onUpdateUser={onUpdateUser}
      />
    )
  }
  return (
    <AdminDashboard
      onLogout={onLogout || (() => onNavigate('signin'))}
      onNavigate={onNavigate}
      onSwitchRole={onSwitchRole}
    />
  )
}

export default App

