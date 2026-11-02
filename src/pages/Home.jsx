import React from 'react';

export default function Home() {
  return (
    <div className="home">
      <div className="home-card">
        <div className="eyebrow">ICU clinical judgment game</div>
        <h1>DKA: One Patient, Five Tables</h1>
        <p className="lead">
          Each table runs one organ system for Jordan, a 22-year-old in severe DKA. No table sees the whole
          picture, so the class has to talk to keep Jordan safe.
        </p>
        <div className="home-actions">
          <a className="btn btn-primary btn-lg" href="#/join">Join a table</a>
          <a className="btn btn-ghost btn-lg" href="#/host">I'm the instructor</a>
        </div>
        <p className="fine">No student accounts or names are collected. Rooms delete themselves after 24 hours.</p>
      </div>
    </div>
  );
}
