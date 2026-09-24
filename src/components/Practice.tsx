import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { consumePracticeRoom, finishPractice, notePracticeRoom, showCoral, skipPractice, useDesk } from '../lib/state';

export function PracticeWatch() {
  const { practice } = useDesk();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/war' || pathname === '/lab' || pathname === '/radar') notePracticeRoom();
    else if (pathname === '/' && practice === 'coral' && consumePracticeRoom()) finishPractice();
  }, [pathname, practice]);
  return null;
}

export function PracticeCard() {
  const { practice } = useDesk();
  if (practice !== 'ask') return null;
  return (
    <div className="practice" role="dialog" aria-label="PRACTICE">
      <div className="practice-card">
        <p className="panel-name">PRACTICE</p>
        <p className="verdict">coral means tap</p>
        <div className="choices">
          <button type="button" className="choice coral" onClick={showCoral}>
            SHOW CORAL
          </button>
          <button type="button" className="choice" onClick={skipPractice}>
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}
