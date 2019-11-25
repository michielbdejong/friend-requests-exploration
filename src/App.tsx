import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { IncomingList } from './components/IncomingList';
import { LoggedOut, LoginButton, LoggedIn, LogoutButton, useWebId } from '@solid/react';
import { MainPanel, PersonSummary } from './components/Person';
import { FriendList } from './components/Friendlist';
import { FriendSelector } from './components/FriendSelector';

const App: React.FC = () => {
  return <>
    <React.StrictMode>
      <BrowserRouter>
        <LoggedOut>
          <section className="section">
            <h1 className="title">Friend Requests Exploration</h1>
            <p className="subtitle">This app requires you to log in.
            Unless launched from the <a href="https://launcher-exploration.inrupt.app/">Launcher app</a>,
            it requires pod-wide <strong>Control</strong> access.</p>
            <LoginButton popup="/popup.html" className="button is-large is-primary">Log in to start using this app</LoginButton>
          </section>
        </LoggedOut>
        <LoggedIn>
          <div className="container">
            <nav className="navbar has-shadow">
              <div className="navbar-start">
               You: <PersonSummary webId={(useWebId() || undefined)} />
              </div>
              <p className="panel-block">
                <FriendSelector onSelect={(webId: string) => {
                  window.location.href = `/profile/${encodeURIComponent(webId)}`;
                }}/>
              </p>
              <div className="navbar-end">
                <LogoutButton className="button is-primary"/>
              </div>
              <div className="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </nav>
          </div>
          <section className="main-content columns is-fullheight">
            <aside className="column is-4 is-narrow-mobile is-fullheight section is-hidden-mobile">
  
              <div className="menu-list">

                <nav className="panel">
                  <IncomingList />
                </nav>
                <nav className="panel">
                  <FriendList />
                </nav>
              </div>
            </aside>
            <Route path="/profile/:webId">
              <div className="container column is-8">
                <div className="section">
                  <div className="card">
                    <MainPanel />
                  </div>
                </div>
              </div>
            </Route>
          </section>
          <footer className="footer is-hidden">
            <div className="container">
              <div className="content has-text-centered">
                <p>Hello</p>
              </div>
            </div>
          </footer>
        </LoggedIn>
      </BrowserRouter>
    </React.StrictMode>
  </>;
}

export default App;
