import React, { useState, useEffect } from 'react';
import UserApp from './components/UserApp';
import AdminApp from './components/AdminApp';

// v1.0.1 - ADMIN LOGIN FIX DEPLOYED
function getHash(): string {
  return window.location.hash.replace('#', '') || 'user';
}

const App: React.FC = () => {
  const [route, setRoute] = useState(getHash());

  useEffect(() => {
    const onHash = () => setRoute(getHash());
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = '#user';
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route === 'admin' ? <AdminApp /> : <UserApp />;
};

export default App;
