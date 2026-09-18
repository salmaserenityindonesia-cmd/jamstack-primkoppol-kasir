import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

const PelunasanPiutang = () => (
  <div className="p-4 bg-white text-black min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Pelunasan Piutang</h1>
    <p>Simulasi komponen React (Pelunasan Piutang) yang telah menggunakan styling Tailwind.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pelunasan" element={<PelunasanPiutang />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
