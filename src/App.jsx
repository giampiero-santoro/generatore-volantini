import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Eye, Printer, FileText, Star, Circle, Tag, Layout, Palette, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';

const FlyerGenerator = () => {
  // --- STATI DELL'APPLICAZIONE ---
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [banner, setBanner] = useState(null);
  const [bannerPosition, setBannerPosition] = useState('top');
  const [layoutStyle, setLayoutStyle] = useState('grid');
  const [paperFormat, setPaperFormat] = useState('a4'); // Supporto A3, A4, B5
  const [activeFields, setActiveFields] = useState({
    image: true, name: true, description: true, price: true,
    oldPrice: true, discount: true, badge: true, validity: true
  });
  const [theme, setTheme] = useState({
    primary: '#D84315', secondary: '#FFF3E0', accent: '#FF6F00', text: '#212121', background: '#FFFFFF'
  });
  const [showPreview, setShowPreview] = useState(false);

  // --- RIFERIMENTI PER INPUT FILE ---
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // --- FUNZIONI DI CARICAMENTO ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      const formatted = jsonData.map((row, idx) => ({
        id: idx,
        name: row.name || row.Nome || 'Prodotto senza nome',
        description: row.description || row.Descrizione || '',
        price: row.price || row.Prezzo || '0.00',
        oldPrice: row.oldPrice || row.PrezzoVecchio || '',
        discount: row.discount || row.Sconto || '',
        image: row.image || null,
        badge: row.badge || '',
        validity: row.validity || ''
      }));
      setProducts(formatted);
      setSelectedProducts(formatted.slice(0, 6)); // Seleziona i primi 6 di default
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setBanner(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // --- GESTIONE LAYOUT ---
  const getLayoutClasses = () => {
    switch (layoutStyle) {
      case 'grid': return 'grid grid-cols-2 gap-6';
      case 'rows': return 'flex flex-col gap-6';
      case 'compact': return 'grid grid-cols-3 gap-4';
      default: return 'grid grid-cols-2 gap-6';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* HEADER INTERFACCIA */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-2 rounded-lg"><Layout size={20}/></div>
          <h1 className="text-xl font-bold tracking-tight">Flyer Generator <span className="text-orange-500">PRO</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition">
            <Eye size={18}/> {showPreview ? 'Modifica' : 'Anteprima'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-lg hover:bg-orange-500 transition shadow-md">
            <Printer size={18}/> Stampa PDF
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        {/* SIDEBAR SINISTRA - CONTROLLI */}
        <aside className="lg:col-span-3 space-y-6">
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Settings size={16}/> Configurazione Carta</h3>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Formato Volantino</label>
            <select value={paperFormat} onChange={(e) => setPaperFormat(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="a4">A4 (Standard 21x29.7)</option>
              <option value="a3">A3 (Poster 29.7x42)</option>
              <option value="b5">B5 (Libretto 17.6x25)</option>
            </select>
          </section>

          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Upload size={16}/> Caricamento Dati</h3>
            <button onClick={() => fileInputRef.current.click()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition mb-2">Importa Excel/CSV</button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx,.csv" />
            <p className="text-[10px] text-slate-400 text-center italic">Colonne: name, description, price, discount, image</p>
          </section>

          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Palette size={16}/> Colore Brand</h3>
            <input type="color" value={theme.primary} onChange={(e) => setTheme({...theme, primary: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer border-none" />
          </section>
        </aside>

        {/* AREA CENTRALE - SELEZIONE PRODOTTI */}
        <main className="lg:col-span-9 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800">Prodotti Disponibili ({products.length})</h3>
            <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">Selezionati: {selectedProducts.length}</span>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><FileText size={32}/></div>
              <p className="text-slate-400">Nessun dato caricato. Inizia importando un file Excel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(p => (
                <div key={p.id} onClick={() => toggleProductSelection(p)} className={`relative p-3 border-2 rounded-2xl cursor-pointer transition-all ${selectedProducts.find(sp => sp.id === p.id) ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className="aspect-square bg-slate-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    {p.image ? <img src={p.image} className="object-cover w-full h-full" alt="" /> : <ImageIcon className="text-slate-200" size={24} />}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs font-black text-orange-600">€{p.price}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* AREA ANTEPRIMA / STAMPA */}
      <div className={`${showPreview ? 'block' : 'hidden'} print:block bg-slate-800/10 py-10 print:py-0 min-h-screen`}>
        <div className={`mx-auto bg-white shadow-2xl print:shadow-none transition-all format-${paperFormat}`} style={{ backgroundColor: theme.background, color: theme.text }}>
          
          {/* Banner Superiore */}
          {banner && bannerPosition === 'top' && <div className="w-full h-48 overflow-hidden"><img src={banner} className="w-full h-full object-cover" alt="Banner" /></div>}

          <div className="p-10">
            <div className={getLayoutClasses()}>
              {selectedProducts.map((p, i) => (
                <div key={i} className="relative flex flex-col bg-white border-2 rounded-[2rem] overflow-hidden p-6 transition-all" style={{ borderColor: theme.secondary }}>
                  {activeFields.badge && p.badge && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1"><Star size={12} fill="white"/> {p.badge}</div>
                  )}
                  
                  {activeFields.image && (
                    <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-50 flex items-center justify-center">
                       {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={48} className="text-slate-200"/>}
                    </div>
                  )}

                  <div className="space-y-2 flex-grow">
                    {activeFields.name && <h3 className="font-black text-2xl uppercase leading-tight" style={{ color: theme.text }}>{p.name}</h3>}
                    {activeFields.description && <p className="text-sm opacity-60 italic line-clamp-2">{p.description}</p>}
                  </div>

                  <div className="mt-6 flex justify-between items-end border-t pt-4 border-slate-50">
                    <div className="flex flex-col">
                      {activeFields.oldPrice && p.oldPrice && <span className="text-lg opacity-40 line-through">€{p.oldPrice}</span>}
                      {activeFields.price && <span className="text-5xl font-black tracking-tighter" style={{ color: theme.primary }}>€{p.price}</span>}
                    </div>
                    {activeFields.discount && p.discount && (
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl text-xl font-black shadow-lg leading-none flex flex-col items-center">
                        <span className="text-[10px] uppercase">Sconto</span>
                        -{p.discount}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <footer className="mt-auto p-8 text-center text-[10px] opacity-40 border-t mx-10">
            Offerte valide fino ad esaurimento scorte. I prezzi possono subire variazioni.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default FlyerGenerator;
