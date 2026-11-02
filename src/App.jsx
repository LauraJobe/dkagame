import React, { useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import Host from './pages/Host.jsx';
import Join from './pages/Join.jsx';
import TableView from './pages/TableView.jsx';
import Screen from './pages/Screen.jsx';
import Guide from './pages/Guide.jsx';
import Print from './pages/Print.jsx';

// Hash routes work on GitHub Pages without server config:
// #/            home
// #/host        instructor dashboard
// #/join        pick a room and table
// #/t/CODE/ID   a table's screen
// #/screen/CODE projector view (read-only)
// #/guide       teacher guide
// #/print       printable student materials
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
  if (first === 'guide') return <Guide />;
  if (first === 'print') return <Print />;
  if (first === 'join') return <Join initialCode={a} />;
  if (first === 'screen' && a) return <Screen code={a.toUpperCase()} />;
  if (first === 't' && a && b) return <TableView code={a.toUpperCase()} tableId={b} />;
  return <Home />;
}

export const go = (path) => {
  window.location.hash = path;
};
