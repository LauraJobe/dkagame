import React, { useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import Host from './pages/Host.jsx';
import Join from './pages/Join.jsx';
import TableView from './pages/TableView.jsx';

// Hash routes work on GitHub Pages without server config:
// #/            home
// #/host        instructor dashboard
// #/join        pick a room and table
// #/t/CODE/ID   a table's screen
function parse() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return parts;
}

export default function App() {
  const [route, setRoute] = useState(parse());
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const [first, a, b] = route;
  if (first === 'host') return <Host />;
  if (first === 'join') return <Join initialCode={a} />;
  if (first === 't' && a && b) return <TableView code={a.toUpperCase()} tableId={b} />;
  return <Home />;
}

export const go = (path) => {
  window.location.hash = path;
};
