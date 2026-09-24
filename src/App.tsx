import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PracticeCard, PracticeWatch } from './components/Practice';
import { Drawer } from './pages/Drawer';
import { Home } from './pages/Home';
import { Lab } from './pages/Lab';
import { Radar } from './pages/Radar';
import { War } from './pages/War';

export function App() {
  return (
    <>
      <Hotkeys />
      <PracticeWatch />
      <PracticeCard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/war" element={<War />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/drawer" element={<Drawer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function Hotkeys() {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const path =
        event.code === 'Digit1' || event.code === 'Numpad1' ? '/war'
        : event.code === 'Digit2' || event.code === 'Numpad2' ? '/lab'
        : event.code === 'Digit3' || event.code === 'Numpad3' ? '/radar'
        : event.code === 'Digit0' || event.code === 'Numpad0' ? '/drawer'
        : event.code === 'Escape' ? '/'
        : null;
      if (!path) return;
      event.preventDefault();
      if (window.location.pathname === path) return;
      navigate({ pathname: path, search: window.location.search });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    function onStart(event: TouchEvent) {
      const touch = event.changedTouches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    }
    function onEnd(event: TouchEvent) {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (dx <= -60 && Math.abs(dy) < 40 && window.location.pathname !== '/') {
        navigate({ pathname: '/', search: window.location.search });
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [navigate]);

  return null;
}
