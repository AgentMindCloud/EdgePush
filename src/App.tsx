import { Navigate, Route, Routes } from "react-router-dom";

function Shell({ title }: { title: string }) {
  return (
    <main className="shell">
      <header className="top">
        <span className="wordmark">DESK</span>
        <span className="clock">--:--</span>
        <span className="live" aria-label="live" />
      </header>
      <p className="quiet">{title}</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell title="home skeleton" />} />
      <Route path="/war" element={<Shell title="war skeleton" />} />
      <Route path="/lab" element={<Shell title="lab skeleton" />} />
      <Route path="/radar" element={<Shell title="radar skeleton" />} />
      <Route path="/drawer" element={<Shell title="drawer skeleton" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
