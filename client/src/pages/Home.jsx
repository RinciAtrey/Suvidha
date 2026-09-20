import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Suvidha Portal</h1>
        <p className="text-muted" style={{ marginBottom: '3rem' }}>The unified document information system for India.</p>
        
        <div className="grid">
          <Link 
            to="/signup"
            className="btn btn-primary" 
            style={{ padding: '1.25rem', fontSize: '1.125rem' }}
          >
            Create an Account
          </Link>
          
          <Link 
            to="/login"
            className="btn btn-outline" 
            style={{ padding: '1.25rem', fontSize: '1.125rem' }}
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
