import React from 'react';
import { Link } from 'react-router-dom';

// Landing-only footer. Matches the Daylight design's wordmark + minimal
// link style. The authenticated app has its own Footer component with
// product-nav links, which isn't appropriate here.

const LandingFooter: React.FC = () => (
  <footer
    className="pt-10 pb-14 text-[13px] text-ink-3"
    style={{ borderTop: '1px solid rgba(15,42,45,0.08)' }}
  >
    <div className="max-w-[1240px] mx-auto px-7 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3.5">
        <span className="font-display text-xl font-medium text-landing-teal leading-none" style={{ letterSpacing: '-0.02em' }}>
          health<em className="italic font-normal text-landing-blue">zone</em>
        </span>
        <span>
          · a{' '}
          <em className="text-sage italic font-display">mgm.zone</em> product
        </span>
      </div>
      <nav className="flex gap-5">
        <Link to="/auth" className="hover:text-ink transition-colors">Log in</Link>
        <Link to="/auth?tab=signup" className="hover:text-ink transition-colors">Sign up</Link>
        <a
          href="https://github.com/mgmzone/healthzone-independent"
          className="hover:text-ink transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>
      <div className="font-mono-ui text-[11px] tracking-wider text-ink-3">
        © {new Date().getFullYear()}
      </div>
    </div>
  </footer>
);

export default LandingFooter;
