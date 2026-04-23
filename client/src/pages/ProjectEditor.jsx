import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Cpu, 
  Globe, 
  GitBranch, 
  Save, 
  ChevronLeft, 
  Maximize2, 
  Command,
  Zap,
  Layout,
  Plus,
  X,
  Eye,
  Share2,
  Settings,
  Link as LinkIcon,
  Server,
  Database,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProjectEditor.css';

const ProjectEditor = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('terminal');
  const [title, setTitle] = useState('new_project_init.sh');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState(['react', 'typescript']);
  const [tagInput, setTagInput] = useState('');
  
  // Layout state
  const [projectSections] = useState([
    { id: 1, title: 'Project Overview', type: 'text' },
    { id: 2, title: 'System Architecture', type: 'diagram' }
  ]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...new Set([...tags, tagInput.trim().toLowerCase()])]);
      setTagInput('');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'terminal':
        return (
          <div className="editor-container">
            <div className="editor-meta">
              <div className="meta-row">
                <span className="meta-key">PROJECT_NAME:</span>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="meta-input title"
                />
              </div>
              <div className="meta-row">
                <span className="meta-key">TAGS:</span>
                <div className="tag-cloud">
                  {tags.map(tag => (
                    <span key={tag} className="console-tag">
                      #{tag}
                      <X size={10} onClick={() => setTags(tags.filter(t => t !== tag))} />
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder="add_tag..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="tag-input"
                  />
                </div>
              </div>
            </div>
            <textarea 
              className="main-textarea"
              placeholder="// Enter project documentation or system description here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        );
      case 'layout':
        return (
          <div className="layout-builder">
            <div className="builder-header">
              <h3>SYSTEM_STRUCTURE_DESIGNER</h3>
              <button className="add-node-btn"><Plus size={14} /> ADD_MODULE</button>
            </div>
            <div className="structure-grid">
              {projectSections.map(section => (
                <div key={section.id} className="structure-card">
                  <div className="card-drag-handle">:::</div>
                  <div className="card-info">
                    <span className="node-id">0{section.id}</span>
                    <input type="text" value={section.title} className="node-title-input" />
                  </div>
                  <div className="card-type">{section.type.toUpperCase()}</div>
                </div>
              ))}
              <div className="structure-card-placeholder">
                <Plus size={24} />
                <span>APPEND_NEW_BLOCK</span>
              </div>
            </div>
          </div>
        );
      case 'globe':
        return (
          <div className="connection-manager">
            <div className="manager-grid">
              <div className="connection-card">
                <div className="conn-header">
                  <GitBranch size={20} className="accent" />
                  <h4>REPOS_GATEWAY</h4>
                </div>
                <div className="conn-body">
                  <div className="input-group">
                    <label>MAIN_REPOSITORY</label>
                    <input type="text" placeholder="https://github.com/..." />
                  </div>
                </div>
              </div>
              <div className="connection-card">
                <div className="conn-header">
                  <Server size={20} className="accent" />
                  <h4>DEPLOY_ENDPOINT</h4>
                </div>
                <div className="conn-body">
                  <div className="input-group">
                    <label>PRODUCTION_URL</label>
                    <input type="text" placeholder="https://project.com" />
                  </div>
                </div>
              </div>
              <div className="connection-card">
                <div className="conn-header">
                  <Database size={20} className="accent" />
                  <h4>DATA_ORCHESTRATOR</h4>
                </div>
                <div className="conn-body">
                  <div className="input-group">
                    <label>API_BASE_URL</label>
                    <input type="text" placeholder="https://api.project.com" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="architect-editor">
      {/* Sidebar Navigation */}
      <aside className="architect-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <Cpu size={24} className="accent-glow" />
          </div>
          <div className="sidebar-tools">
            <button 
              className={`tool-icon ${activeView === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveView('terminal')}
            >
              <Terminal size={20} />
            </button>
            <button 
              className={`tool-icon ${activeView === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveView('layout')}
            >
              <Layout size={20} />
            </button>
            <button 
              className={`tool-icon ${activeView === 'globe' ? 'active' : ''}`}
              onClick={() => setActiveView('globe')}
            >
              <Globe size={20} />
            </button>
          </div>
        </div>
        <div className="sidebar-bottom">
          <button className="tool-icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </aside>

      {/* Main Console */}
      <main className="console-main">
        <header className="console-header">
          <div className="header-status">
            <div className="status-indicator online" />
            <span className="mono-label">SESSION_ACTIVE | {activeView.toUpperCase()}</span>
          </div>
          <div className="header-tabs">
            <div className="tab active">
              {activeView === 'terminal' && <Code2 size={14} />}
              {activeView === 'layout' && <Layout size={14} />}
              {activeView === 'globe' && <Globe size={14} />}
              <span>{activeView === 'terminal' ? title : `${activeView}_config.sys`}</span>
              <X size={12} />
            </div>
          </div>
          <div className="header-actions">
            <button className="console-btn ghost"><Eye size={16} /> VIEW_LIVE</button>
            <button className="console-btn primary" onClick={() => navigate('/dashboard')}>
              <Share2 size={16} /> SHARE
            </button>
          </div>
        </header>

        <div className="console-body">
          {activeView === 'terminal' && (
            <div className="line-numbers">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          )}
          
          {renderContent()}
        </div>

        <footer className="console-footer">
          <div className="footer-left">
            <div className="footer-item"><Maximize2 size={12} /> MODE: {activeView.toUpperCase()}</div>
            <div className="footer-item">JavaScript (React)</div>
          </div>
          <div className="footer-right">
            <div className="footer-item"><Zap size={12} /> Sync: Online</div>
            <div className="footer-item"><Command size={12} /> + S to Commit</div>
          </div>
        </footer>
      </main>

      {/* Floating Action Menu */}
      <div className="command-palette-hint">
        Press <span className="kbd">CTRL</span> + <span className="kbd">K</span> for Command Palette
      </div>
    </div>
  );
};

export default ProjectEditor;
