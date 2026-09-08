import { useState } from 'react'
import './App.css'
import web4jobLogo from './assets/web4job.png'

function App() {
  const [page, setPage] = useState('signin')
  const [role, setRole] = useState('admin')
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

  if (page === 'dashboard') {
    return <Dashboard role={role} onNavigate={setPage} onSwitchRole={openDashboard} />
  }

  return (
    <AuthPage
      mode={page}
      onModeChange={setPage}
      loginError={loginError}
      registrationMessage={registrationMessage}
      onSubmit={(credentials) => {
        if (page === 'signup') {
          const user = { name: `${credentials.firstName} ${credentials.lastName}`.trim(), email: credentials.email, password: credentials.password }
          localStorage.setItem('resumeflow-user', JSON.stringify(user))
          setRegisteredUser(user)
          setLoginError('')
          setRegistrationMessage('Inscription réussie ! Vous pouvez maintenant vous connecter avec vos identifiants.')
          setPage('signin')
          return
        }
        const matchesAdmin = credentials.email === 'admin' && credentials.password === 'admin'
        const matchesRegisteredUser = registeredUser && credentials.email === registeredUser.email && credentials.password === registeredUser.password
        if (!matchesAdmin && !matchesRegisteredUser) {
          setLoginError('Identifiant ou mot de passe incorrect.')
          return
        }
        setLoginError('')
        setRegistrationMessage('')
        openDashboard(matchesRegisteredUser ? 'user' : 'admin')
      }}
    />
  )
}

function Brand() {
  return <div className="brand"><img src={web4jobLogo} alt="Web4Jobs" style={{ display: 'block', width: '220px', maxHeight: '74px', objectFit: 'contain', objectPosition: 'left center' }} /></div>
}

function AuthPage({ mode, onModeChange, onSubmit, loginError, registrationMessage }) {
  const isSignup = mode === 'signup'
  return (
    <main className={`auth-page ${isSignup ? 'signup-page' : ''}`}>
      <section className="auth-panel" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Brand />
        <div className="auth-heading">
          <h1>{isSignup ? 'JOIN RESUMEFLOW' : 'WELCOME BACK'}</h1>
          <p>{isSignup ? 'Create your free account and start building your career today.' : 'Please enter your details to log in to your account.'}</p>
        </div>
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ firstName: event.currentTarget.firstName?.value || '', lastName: event.currentTarget.lastName?.value || '', email: event.currentTarget.email.value, password: event.currentTarget.password.value }) }}>
          {isSignup && <div className="field-row"><Field name="firstName" label="FIRST NAME" placeholder="John" /><Field name="lastName" label="LAST NAME" placeholder="Doe" /></div>}
          <Field name="email" label="EMAIL ADDRESS" placeholder={isSignup ? 'name@company.com' : 'name@company.com'} type="text" />
          <Field name="password" label="PASSWORD" placeholder={isSignup ? 'At least 8 characters' : '••••••••••••'} type="password" />
          {isSignup && <Field label="EXPERTISE" placeholder="UI/UX Design" />}
          {!isSignup && <label className="remember"><input type="checkbox" /> Remember me for 30 days</label>}
          <button className="primary-button" type="submit">{isSignup ? 'CREATE FREE ACCOUNT' : 'LOG IN TO ACCOUNT'}</button>
        </form>
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

function Field({ name, label, placeholder, type = 'text', action }) {
  return <label className="field"><span>{label}<em>{action}</em></span><input name={name} type={type} placeholder={placeholder} required /></label>
}

function Dashboard({ role, onNavigate, onSwitchRole }) {
  const user = role === 'user'
  const title = user ? 'Mon espace utilisateur' : 'Admin dashboard'
  const stats = user ? [['MES CV', '3', '+1', 'purple'], ['PROFIL', '82%', '+12.4%', 'blue'], ['VUES DU CV', '248', '+18.9%', 'green'], ['CANDIDATURES', '12', '+4', 'orange']] : [['TOTAL USERS', '24,892', '+12.4%', 'purple'], ['ACTIVE RESUMES', '18,430', '+8.2%', 'blue'], ['MONTHLY REVENUE', '$48,290', '+18.9%', 'green'], ['SUPPORT TICKETS', '38', '-4.1%', 'orange']]
  return <main className="dashboard-page">
    <aside className="sidebar"><Brand /><div className="role-badge">{user ? 'UTILISATEUR' : 'ADMINISTRATOR'}</div><nav><button className="active"><span>▦</span> {user ? 'Mon aperçu' : 'Overview'}</button><button><span>♙</span> {user ? 'Mes CV' : 'User management'}</button><button><span>◫</span> {user ? 'Candidatures' : 'Analytics'}</button><button><span>⚙</span> Settings</button></nav><button className="logout" onClick={() => onNavigate('signin')}>↪ &nbsp; Log out</button></aside>
    <section className="dashboard-main"><header className="dash-header"><div><span className="eyebrow">MONDAY, SEPTEMBER 07, 2026</span><h1>{user ? 'Bonjour utilisateur' : 'Bonjour administrateur'}</h1><p>{title} · Here’s what’s happening with your workspace today.</p></div><div className="header-actions"><button className="icon-button">⌕</button><button className="icon-button">♧</button><span className="profile-avatar">AM</span><button className="profile-name">{user ? 'Mon profil' : 'Admin'} ▾</button></div></header>
      <div className="dashboard-toolbar"><div className="tabs"><button className="selected">Last 30 days</button><button>Last 7 days</button><button>Custom range</button></div><button className="export-button">⇩ &nbsp; Export report</button></div>
      <div className="stats-grid">{stats.map(([label, value, change, color]) => <article className="stat-card" key={label}><div className={`stat-icon ${color}`}>◈</div><span>{label}</span><strong>{value}</strong><small className={change.startsWith('-') ? 'down' : ''}>{change} <i>vs previous period</i></small></article>)}</div>
      <div className="dashboard-grid"><article className="panel chart-panel"><div className="panel-title"><div><h2>{user ? 'Activité de mes CV' : 'User growth'}</h2><p>{user ? 'Suivi de vos candidatures' : 'New accounts created over time'}</p></div><button>Monthly ▾</button></div><div className="chart"><div className="chart-lines"><span>$80k</span><span>$60k</span><span>$40k</span><span>$20k</span><span>$0</span></div><div className="bars">{[32, 45, 39, 57, 53, 68, 61, 77, 72, 84, 76, 92].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}</div><div className="chart-labels"><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></article><article className="panel activity-panel"><div className="panel-title"><div><h2>Recent activity</h2><p>Latest workspace events</p></div><button>View all →</button></div><ul className="activity-list"><li><span className="activity-dot purple">♙</span><div><b>{user ? 'CV mis à jour' : 'New user registered'}</b><small>{user ? 'Votre CV Product Designer est à 92%' : 'Sarah Jenkins joined the platform'}</small></div><time>2m ago</time></li><li><span className="activity-dot green">✓</span><div><b>{user ? 'Candidature envoyée' : 'Resume approved'}</b><small>{user ? 'Marketing Manager · James Wilson' : 'Marketing Manager · James Wilson'}</small></div><time>18m ago</time></li><li><span className="activity-dot orange">!</span><div><b>Support ticket opened</b><small>Issue with resume export</small></div><time>1h ago</time></li></ul></article></div>
      <article className="panel table-panel"><div className="panel-title"><div><h2>{user ? 'Mes CV récents' : 'Top active users'}</h2><p>{user ? 'Documents récemment modifiés' : 'Users with the highest engagement'}</p></div><button>View all →</button></div><table><thead><tr><th>{user ? 'CV' : 'USER'}</th><th>STATUS</th><th>LAST UPDATED</th><th>PROGRESS</th><th></th></tr></thead><tbody>{[['Sarah Jenkins', 'Product Designer', 'Active', '92%'], ['James Wilson', 'Marketing Manager', 'Active', '76%'], ['Maya Patel', 'Software Engineer', 'Draft', '54%'], ['David Chen', 'UX Researcher', 'Active', '88%']].map(([name, job, status, progress], index) => <tr key={name}><td><span className="table-avatar">{name.split(' ').map(word => word[0]).join('')}</span><b>{user ? job : name}</b><small>{user ? 'Mis à jour récemment' : job}</small></td><td><span className={`status ${status.toLowerCase()}`}>{status}</span></td><td>Sep {index + 1}, 2026</td><td><div className="progress"><i style={{ width: progress }} /></div><small>{progress}</small></td><td><button className="more">•••</button></td></tr>)}</tbody></table></article>
      <button className="switch-dashboard" onClick={() => onSwitchRole(user ? 'admin' : 'user')}>Preview {user ? 'admin' : 'user'} dashboard</button>
    </section>
  </main>
}

export default App
