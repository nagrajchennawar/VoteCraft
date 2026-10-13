import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine, ArrowRight, BarChart3, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Eye, EyeOff, FilePlus2, LockKeyhole, LogOut, Menu,
  Moon, MoreHorizontal, Plus, Search, Settings2, ShieldAlert, Sparkles,
  Sun, Trash2, Users, Vote, X,
} from 'lucide-react'

const STORAGE_KEY = 'votesphere-prototype-v1'
// Demo-only gate: this password is bundled with the public client and is not secure.
const ADMIN_PASSWORD = 'Sangam08@'
const starterPolls = [
  {
    id: 'team-outing',
    title: 'Team outing',
    question: 'Should we organize a team outing this month?',
    description: 'Help us plan something fun together. Cast your vote before the poll closes.',
    options: ['Yes', 'No'],
    createdAt: new Date().toISOString(),
    closedAt: null,
    isOpen: true,
    publicResults: true,
    votes: [],
  },
  {
    id: 'learning',
    title: 'Next team skill',
    question: 'Which technology should we learn next?',
    description: 'Pick the topic you are most excited to explore.',
    options: ['React', 'Next.js', 'Angular', 'AI/ML', 'Node.js'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    closedAt: null,
    isOpen: true,
    publicResults: true,
    votes: [],
  },
]

function readSaved() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return null
    const parsed = JSON.parse(value)
    return Array.isArray(parsed.polls) ? parsed : null
  } catch {
    return null
  }
}

function prettyDate(date, options = { month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(date))
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

function App() {
  const [saved] = useState(readSaved)
  const [polls, setPolls] = useState(saved?.polls || starterPolls)
  const [activeId, setActiveId] = useState(saved?.activeId || starterPolls[0].id)
  const [name, setName] = useState(() => sessionStorage.getItem('votesphere-name') || '')
  const [hasIdentity, setHasIdentity] = useState(() => Boolean(sessionStorage.getItem('votesphere-name')))
  const [selectedOption, setSelectedOption] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [dark, setDark] = useState(() => localStorage.getItem('votesphere-theme') === 'dark')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filterOption, setFilterOption] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [identityConfirm, setIdentityConfirm] = useState(false)
  const [draft, setDraft] = useState(null)

  const activePoll = polls.find((poll) => poll.id === activeId) || polls[0]
  const ownVote = activePoll?.votes.find((vote) => vote.name.toLowerCase() === name.trim().toLowerCase())
  const totalVotes = activePoll?.votes.length || 0
  const totalParticipants = new Set(activePoll?.votes.map((vote) => vote.name.toLowerCase())).size
  const completedCount = polls.filter((poll) => !poll.isOpen).length
  const voteStats = useMemo(() => activePoll?.options.map((option) => ({
    option,
    count: activePoll.votes.filter((vote) => vote.option === option).length,
  })) || [], [activePoll])
  const allOptions = [...new Set(polls.flatMap((poll) => poll.options))]
  const filteredVotes = useMemo(() => polls.flatMap((poll) => poll.votes
    .filter((vote) => vote.name.toLowerCase().includes(search.toLowerCase())
      && (filterOption === 'all' || vote.option === filterOption))
    .map((vote) => ({ ...vote, pollId: poll.id, pollTitle: poll.title }))), [polls, filterOption, search])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ polls, activeId }))
  }, [polls, activeId])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('votesphere-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!activePoll) return null

  function selectPoll(id) {
    setActiveId(id)
    setSelectedOption('')
    setAdminOpen(false)
    setSettingsOpen(false)
    setMobileMenu(false)
  }

  function openAdmin() {
    setAdminOpen(true)
    setAdminAuthenticated(false)
    setAdminPassword('')
    setAdminError('')
    setSettingsOpen(false)
    setMobileMenu(false)
  }

  function loginAdmin(event) {
    event.preventDefault()
    if (adminPassword !== ADMIN_PASSWORD) {
      setAdminError('That password is not correct. Please try again.')
      return
    }
    setAdminAuthenticated(true)
    setAdminPassword('')
    setAdminError('')
  }

  function logoutAdmin() {
    setAdminAuthenticated(false)
    setAdminOpen(false)
    setAdminPassword('')
  }

  function continueWithName(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNotice('Please enter your name to continue.')
      return
    }
    setName(trimmed)
    sessionStorage.setItem('votesphere-name', trimmed)
    setHasIdentity(true)
  }

  function submitVote() {
    if (!hasIdentity || !name.trim()) {
      setHasIdentity(false)
      setNotice('Enter your name before voting.')
      return
    }
    if (!selectedOption) {
      setNotice('Choose an option before submitting your vote.')
      return
    }
    if (activePoll.votes.some((vote) => vote.name.toLowerCase() === name.trim().toLowerCase())) {
      setNotice('This name has already voted in this poll.')
      return
    }
    setIdentityConfirm(true)
  }

  function confirmVote() {
    setPolls((items) => items.map((poll) => poll.id === activeId
      ? { ...poll, votes: [...poll.votes, { name: name.trim(), option: selectedOption, votedAt: new Date().toISOString() }] }
      : poll))
    setIdentityConfirm(false)
    setNotice('Your vote has been counted. Thank you for participating!')
  }

  function beginEdit() {
    setDraft({ ...activePoll, options: [...activePoll.options] })
    setEditing(true)
    setShowCreate(false)
    setSettingsOpen(false)
  }

  function beginCreate() {
    setDraft({
      title: '', question: '', description: '', options: ['Yes', 'No'],
      isOpen: true, publicResults: true,
    })
    setShowCreate(true)
    setEditing(false)
    setSettingsOpen(false)
  }

  function saveDraft(event) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.question.trim()) {
      setNotice('Add a poll title and voting question.')
      return
    }
    const options = draft.options.map((option) => option.trim())
    const normalizedOptions = options.map((option) => option.toLocaleLowerCase())
    if (options.some((option) => !option) || new Set(normalizedOptions).size !== options.length) {
      setNotice('Options cannot be empty or duplicated.')
      return
    }
    if (options.length < 2) {
      setNotice('A poll needs at least two different options.')
      return
    }
    if (showCreate) {
      const created = { ...draft, id: crypto.randomUUID(), options, votes: [], createdAt: new Date().toISOString(), closedAt: null }
      setPolls((items) => [created, ...items])
      setActiveId(created.id)
      setNotice('Your new poll is ready.')
    } else {
      setPolls((items) => items.map((poll) => poll.id === activeId
        ? { ...poll, ...draft, options }
        : poll))
      setNotice('Poll settings saved.')
    }
    setDraft(null)
    setShowCreate(false)
    setEditing(false)
  }

  function togglePoll() {
    setPolls((items) => items.map((poll) => poll.id === activeId
      ? { ...poll, isOpen: !poll.isOpen, closedAt: poll.isOpen ? new Date().toISOString() : null }
      : poll))
    setNotice(activePoll.isOpen ? 'Voting is now closed.' : 'Voting is open again.')
    setSettingsOpen(false)
  }

  function resetPoll() {
    setPolls((items) => items.map((poll) => poll.id === activeId ? { ...poll, votes: [] } : poll))
    setConfirmReset(false)
    setNotice('All votes for this poll have been reset.')
  }

  function exportCsv() {
    const rows = [['Poll', 'Voter name', 'Selected option', 'Voted at'], ...filteredVotes.map((vote) => [vote.pollTitle, vote.name, vote.option, new Date(vote.votedAt).toLocaleString()])]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = `${activePoll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-votes.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function addOption() {
    setDraft((value) => ({ ...value, options: [...value.options, ''] }))
  }

  function updateOption(index, value) {
    setDraft((current) => ({ ...current, options: current.options.map((option, i) => i === index ? value : option) }))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setAdminOpen(false) }}>
          <span className="brand-mark"><Vote size={21} strokeWidth={2.4} /></span>
          <span className="brand-copy"><strong>VoteSphere</strong><small>Your Voice, Your Choice.</small></span>
        </a>
        <button className="mobile-menu icon-button" aria-label="Toggle navigation" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={19} /></button>
        <nav className={`top-nav ${mobileMenu ? 'nav-open' : ''}`} aria-label="Main navigation">
          <button className={!adminOpen ? 'nav-link selected' : 'nav-link'} onClick={() => { setAdminOpen(false); setAdminAuthenticated(false); setMobileMenu(false) }}>Explore polls</button>
          <button className={adminOpen ? 'nav-link selected' : 'nav-link'} onClick={openAdmin}>Admin data</button>
        </nav>
        <div className="top-actions">
          <button className="icon-button theme-toggle" aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <div className="settings-wrap">
            <button className={`icon-button settings-button ${settingsOpen ? 'active' : ''}`} aria-label="Poll settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}><Settings2 size={18} /></button>
            {settingsOpen && <div className="settings-popover">
              <div className="popover-heading"><div><strong>Poll settings</strong><small>Manage this voting space</small></div><button className="plain-icon" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X size={16} /></button></div>
              <button className="setting-item" onClick={beginEdit}><span className="setting-icon"><Settings2 size={16} /></span><span><strong>Edit current poll</strong><small>Question, options and visibility</small></span><ArrowRight size={15} /></button>
              <button className="setting-item" onClick={beginCreate}><span className="setting-icon"><FilePlus2 size={16} /></span><span><strong>Create a poll</strong><small>Start a new team vote</small></span><ArrowRight size={15} /></button>
              <button className="setting-item" onClick={togglePoll}><span className="setting-icon"><LockKeyhole size={16} /></span><span><strong>{activePoll.isOpen ? 'Close voting' : 'Reopen voting'}</strong><small>Currently {activePoll.isOpen ? 'open' : 'closed'}</small></span><ArrowRight size={15} /></button>
              <button className="setting-item destructive" onClick={() => { setConfirmReset(true); setSettingsOpen(false) }}><span className="setting-icon"><Trash2 size={16} /></span><span><strong>Reset this poll</strong><small>Remove all recorded votes</small></span><ArrowRight size={15} /></button>
            </div>}
          </div>
          <div className="avatar" title={hasIdentity ? name : 'Guest'}>{hasIdentity ? name.trim().slice(0, 1).toUpperCase() : 'G'}</div>
        </div>
      </header>

      <main>
        <div className="page-wrap">
          <div className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={13} /> A little more say in what happens</div><h1>Good things happen when <span>we decide together.</span></h1><p className="welcome-subtitle">Cast your vote, see where the team stands, and make every voice count.</p></div>
            <button className="primary-button create-button" onClick={beginCreate}><Plus size={17} /> Create a poll</button>
          </div>
          <div className="prototype-note"><span className="note-dot" /><span><strong>Local prototype</strong> — votes are saved in this browser only. The demo password does not secure voter data.</span><button onClick={() => setNotice('For private, shared voting, connect a backend with server-side authentication and storage.')}>Learn more <ArrowRight size={13} /></button></div>

          <div className="workspace-grid">
            <aside className="sidebar">
              <div className="sidebar-heading"><span>YOUR POLLS</span><button className="plain-icon" aria-label="Create poll" onClick={beginCreate}><Plus size={16} /></button></div>
              <div className="poll-list">
                {polls.map((poll) => {
                  const active = poll.id === activeId
                  return <button className={`poll-list-item ${active ? 'current' : ''}`} key={poll.id} onClick={() => selectPoll(poll.id)}>
                    <span className={`poll-icon ${poll.isOpen ? '' : 'closed'}`}>{poll.isOpen ? <BarChart3 size={17} /> : <CheckCircle2 size={17} />}</span>
                    <span className="poll-list-copy"><strong>{poll.title}</strong><small>{poll.votes.length} {poll.votes.length === 1 ? 'vote' : 'votes'} · {poll.isOpen ? 'Open' : 'Completed'}</small></span>
                    {active && <span className="active-indicator" />}
                  </button>
                })}
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-heading"><span>AT A GLANCE</span></div>
              <div className="glance-row"><span className="glance-icon purple"><Vote size={16} /></span><span>All polls</span><strong>{polls.length}</strong></div>
              <div className="glance-row"><span className="glance-icon green"><Check size={16} /></span><span>Active</span><strong>{polls.length - completedCount}</strong></div>
              <div className="glance-row"><span className="glance-icon amber"><Clock3 size={16} /></span><span>Completed</span><strong>{completedCount}</strong></div>
              <div className="sidebar-tip"><span className="tip-icon"><CircleHelp size={17} /></span><p><strong>Make it count</strong><br />One vote per name, per poll in this browser.</p></div>
            </aside>

            <section className="main-content">
              {adminOpen ? <section className="admin-card">
                {!adminAuthenticated ? <div className="admin-login">
                  <div className="admin-icon"><LockKeyhole size={19} /></div>
                  <span className="eyebrow">ADMIN PANEL</span>
                  <h2>Enter your password</h2>
                  <p>Use the password to view poll voter records.</p>
                  <form onSubmit={loginAdmin}>
                    <label className="field-label" htmlFor="admin-password">Administrator password</label>
                    <div className="password-field"><input id="admin-password" className="text-input" type={showAdminPassword ? 'text' : 'password'} value={adminPassword} onChange={(event) => { setAdminPassword(event.target.value); setAdminError('') }} autoComplete="current-password" /><button type="button" className="password-visibility" aria-label={showAdminPassword ? 'Hide password' : 'Show password'} onClick={() => setShowAdminPassword(!showAdminPassword)}>{showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                    {adminError && <p className="form-error" role="alert">{adminError}</p>}
                    <button className="primary-button full-button" type="submit">View admin data <ArrowRight size={15} /></button>
                  </form>
                  <div className="security-warning"><ShieldAlert size={19} /><div><strong>Demo-only password gate.</strong><p>The password is included in the React app and can be found or bypassed by any visitor. It does not make voter details private.</p></div></div>
                </div> : <>
                <div className="admin-heading"><span className="admin-icon"><LockKeyhole size={19} /></span><div><span className="eyebrow">LOCAL DEMO DATA</span><h2>Poll voter records</h2><p>Voter-level information stored in this browser.</p></div><button className="secondary-button logout-button" onClick={logoutAdmin}><LogOut size={15} /> Log out</button></div>
                <div className="security-warning"><ShieldAlert size={19} /><div><strong>This is not secure admin authentication.</strong><p>The password is embedded in client-side React code and can be inspected or bypassed. Do not use for sensitive voting. True privacy requires server-side authentication and authorization.</p></div></div>
                <div className="admin-stats"><Stat icon={<Vote size={17} />} label="Total votes" value={totalVotes} /><Stat icon={<Users size={17} />} label="Participants" value={totalParticipants} /><Stat icon={<span className={`status-dot ${activePoll.isOpen ? 'open' : 'closed'}`} />} label="Poll status" value={activePoll.isOpen ? 'Open' : 'Closed'} /></div>
                <div className="admin-results">
                  <div className="section-title"><div><h3>Option breakdown</h3><p>Results for {activePoll.title}</p></div></div>
                  {voteStats.map((stat, index) => <div className="admin-option" key={stat.option}><div><span>{stat.option}</span><strong>{stat.count} <small>({percent(stat.count, totalVotes)}%)</small></strong></div><div className="progress-track"><span style={{ width: `${percent(stat.count, totalVotes)}%` }} className={`progress-fill color-${index % 5}`} /></div></div>)}
                </div>
                <div className="voter-table-head"><div className="section-title"><div><h3>Polls & voter choices</h3><p>{filteredVotes.length} voter records shown</p></div><button className="secondary-button export-button" onClick={exportCsv}><ArrowDownToLine size={15} /> Export CSV</button></div></div>
                <div className="table-filters"><label className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search voter name" /></label><label className="filter-select"><span className="sr-only">Filter by option</span><select value={filterOption} onChange={(event) => setFilterOption(event.target.value)}><option value="all">All options</option>{allOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label></div>
                {polls.map((poll) => {
                  const pollVotes = filteredVotes.filter((vote) => vote.pollId === poll.id)
                  return <details className="poll-record-group" key={poll.id} open>
                    <summary><span><strong>{poll.title}</strong><small>{poll.question}</small></span><span className={`status-pill ${poll.isOpen ? 'open' : 'closed'}`}><span />{poll.isOpen ? 'Open' : 'Closed'}</span></summary>
                    {pollVotes.length ? <div className="table-scroll"><table><thead><tr><th>VOTER</th><th>SELECTED OPTION</th><th>DATE & TIME</th></tr></thead><tbody>{pollVotes.map((vote, index) => <tr key={`${poll.id}-${vote.name}-${index}`}><td><span className="table-avatar">{vote.name.slice(0, 1).toUpperCase()}</span>{vote.name}</td><td><span className="option-chip">{vote.option}</span></td><td>{prettyDate(vote.votedAt, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td></tr>)}</tbody></table></div> : <div className="poll-record-empty">{search || filterOption !== 'all' ? 'No matching voter records for this poll.' : 'No votes recorded for this poll yet.'}</div>}
                  </details>
                })}
                </>}
              </section> : <>
                <div className="poll-title-row"><div>                <div className="poll-meta"><span className={`status-pill ${activePoll.isOpen ? 'open' : 'closed'}`}><span />{activePoll.isOpen ? 'Voting open' : 'Voting closed'}</span><span className="meta-separator">·</span><span>Created {prettyDate(activePoll.createdAt)}</span>{activePoll.closedAt && <><span className="meta-separator">·</span><span>Closed {prettyDate(activePoll.closedAt)}</span></>}</div><h2>{activePoll.question}</h2><p>{activePoll.description}</p></div><button className="dots-button" aria-label="Poll actions" onClick={() => setSettingsOpen(!settingsOpen)}><MoreHorizontal size={20} /></button></div>
                <div className="poll-progress"><span><span className="progress-mini" /><strong>{activePoll.isOpen ? 'Voting is in progress' : 'This poll has ended'}</strong></span><span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} so far</span></div>
                <div className="content-columns">
                  <div className="vote-column">
                    {ownVote ? <div className="already-voted"><div className="success-badge"><Check size={19} /></div><span className="eyebrow">THANK YOU FOR PARTICIPATING</span><h3>Your voice is in.</h3><p>You voted <strong>{ownVote.option}</strong> in this poll. Results are shown alongside your choice below.</p></div> : !hasIdentity ? <div className="identity-card"><div className="identity-top"><span className="step-number">01</span><div><span className="eyebrow">FIRST, A QUICK INTRO</span><h3>Who’s casting a vote?</h3><p>Your name helps us keep one vote per person for this poll.</p></div></div><form onSubmit={continueWithName}><label className="field-label" htmlFor="voter-name">Your name</label><input id="voter-name" className="text-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex Morgan" autoComplete="name" maxLength={80} /><button className="primary-button full-button" type="submit">Continue to voting <ArrowRight size={16} /></button><p className="privacy-hint"><LockKeyhole size={13} /> Your name stays in this browser session.</p></form></div> : <div className="vote-card"><div className="vote-card-top"><div><span className="step-number">01</span><span className="eyebrow">MAKE YOUR CHOICE</span></div><span className="voter-tag"><span className="tiny-avatar">{name.trim().slice(0, 1).toUpperCase()}</span>{name}</span></div><h3>What do you think?</h3><p className="card-description">Select one option. You can only vote once.</p><div className="options-list">{activePoll.options.map((option, index) => <button key={option} disabled={!activePoll.isOpen} className={`option-card ${selectedOption === option ? 'chosen' : ''}`} onClick={() => setSelectedOption(option)} aria-pressed={selectedOption === option}><span className={`option-letter letter-${index % 5}`}>{String.fromCharCode(65 + index)}</span><span className="option-name">{option}</span><span className={`radio-circle ${selectedOption === option ? 'checked' : ''}`}>{selectedOption === option && <Check size={12} />}</span></button>)}</div><button className="primary-button full-button submit-button" disabled={!activePoll.isOpen || !selectedOption} onClick={submitVote}>{activePoll.isOpen ? <>Submit my vote <ArrowRight size={16} /></> : 'Voting is closed'}</button><p className="privacy-hint"><LockKeyhole size={13} /> Your vote is final and cannot be changed.</p></div>}
                    <div className="small-note"><span className="note-bullet" /><span>Every vote matters. Thanks for helping shape the decision.</span></div>
                  </div>
                  <div className="results-card"><div className="results-heading"><div><span className="eyebrow">THE TEAM’S PULSE</span><h3>Live results</h3></div><span className="live-badge"><span /> LIVE</span></div>{activePoll.publicResults ? <><div className="result-total"><strong>{totalVotes}</strong><span>total votes</span><span className="participants"><Users size={14} /> {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}</span></div><div className="result-options">{voteStats.map((stat, index) => <div className="result-option" key={stat.option}><div className="result-label"><span><i className={`result-dot color-${index % 5}`} />{stat.option}</span><strong>{percent(stat.count, totalVotes)}<small>%</small></strong></div><div className="progress-track"><span className={`progress-fill color-${index % 5}`} style={{ width: `${percent(stat.count, totalVotes)}%` }} /></div><span className="vote-count">{stat.count} {stat.count === 1 ? 'vote' : 'votes'}</span></div>)}</div><div className="results-foot"><BarChart3 size={15} /><span>Results update after each vote</span></div></> : <div className="results-private"><EyeOff size={22} /><strong>Results are private</strong><span>The poll creator has hidden public results.</span></div>}</div>
                </div>
              </>}
            </section>
          </div>
          <footer className="page-footer"><span>© 2026 VoteSphere</span><span>Made for better decisions, together <span className="footer-heart">♥</span></span><button onClick={() => setNotice('VoteSphere local prototype. Votes and poll settings are stored in your browser only.')}>About this demo</button></footer>
        </div>
      </main>

      {(showCreate || editing) && draft && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowCreate(false); setEditing(false) } }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="poll-editor-title"><div className="modal-heading"><div><span className="eyebrow">{showCreate ? 'START A CONVERSATION' : 'POLL SETTINGS'}</span><h2 id="poll-editor-title">{showCreate ? 'Create a poll' : 'Edit poll'}</h2></div><button className="icon-button" aria-label="Close" onClick={() => { setShowCreate(false); setEditing(false) }}><X size={18} /></button></div><form onSubmit={saveDraft} className="editor-form"><label className="field-label">Poll title<input className="text-input" value={draft.title} maxLength={80} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Team outing" /></label><label className="field-label">Voting question<input className="text-input" value={draft.question} maxLength={180} onChange={(event) => setDraft({ ...draft, question: event.target.value })} placeholder="What should we decide together?" /></label><label className="field-label">Description <span className="optional-label">Optional</span><textarea className="text-input textarea" rows="3" maxLength={300} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add a little context for voters..." /></label><div className="options-editor-head"><span className="field-label">Voting options <span className="optional-label">Minimum 2</span></span><button className="text-button" type="button" onClick={addOption}><Plus size={14} /> Add option</button></div>{draft.options.map((option, index) => <div className="option-edit-row" key={index}><span className={`option-letter letter-${index % 5}`}>{String.fromCharCode(65 + index)}</span><input className="text-input" value={option} maxLength={60} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} />{draft.options.length > 2 && <button className="plain-icon remove-option" type="button" aria-label={`Remove option ${index + 1}`} onClick={() => setDraft((value) => ({ ...value, options: value.options.filter((_, i) => i !== index) }))}><Trash2 size={15} /></button>}</div>)}<label className="toggle-setting"><span><strong>Show public results</strong><small>Let voters see aggregated totals</small></span><input type="checkbox" checked={draft.publicResults} onChange={(event) => setDraft({ ...draft, publicResults: event.target.checked })} /><i /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => { setShowCreate(false); setEditing(false) }}>Cancel</button><button className="primary-button" type="submit">{showCreate ? 'Create poll' : 'Save changes'} <ArrowRight size={15} /></button></div></form></section></div>}
      {identityConfirm && <ConfirmDialog title="Confirm your vote" message={`You’re voting as ${name.trim()} for “${selectedOption}”. This vote can’t be changed.`} confirmLabel="Confirm vote" onCancel={() => setIdentityConfirm(false)} onConfirm={confirmVote} />}
      {confirmReset && <ConfirmDialog title="Reset this poll?" message="This permanently removes every vote recorded for this poll in this browser. This action cannot be undone." confirmLabel="Reset poll" destructive onCancel={() => setConfirmReset(false)} onConfirm={resetPoll} />}
      {notice && <div className="toast" role="status"><CheckCircle2 size={17} />{notice}<button className="plain-icon" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></div>}
    </div>
  )
}

function Stat({ icon, label, value }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>
}

function ConfirmDialog({ title, message, confirmLabel, destructive, onCancel, onConfirm }) {
  return <div className="modal-backdrop"><section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><div className={`confirm-icon ${destructive ? 'danger' : ''}`}>{destructive ? <Trash2 size={20} /> : <CheckCircle2 size={20} />}</div><h2 id="confirm-title">{title}</h2><p id="confirm-description">{message}</p><div className="modal-actions"><button className="secondary-button" onClick={onCancel}>Go back</button><button className={`primary-button ${destructive ? 'danger-button' : ''}`} onClick={onConfirm}>{confirmLabel}</button></div></section></div>
}

export default App
