import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function LogoCustomizerModal({ logo, onClose, onSaveSuccess }) {
  const [brandName, setBrandName] = useState(logo?.brand_name || 'Brand');
  const [tagline, setTagline] = useState('');
  const [layout, setLayout] = useState('vertical'); // vertical, horizontal
  const [fontFamily, setFontFamily] = useState('Inter'); // Inter, Montserrat, Playfair Display, Outfit
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  const [fontSizeName, setFontSizeName] = useState(48);
  const [fontSizeTagline, setFontSizeTagline] = useState(24);
  const [gap, setGap] = useState(20);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const croppedLogoRef = useRef(null);

  // Load Google Fonts inside document head dynamically on mount
  useEffect(() => {
    const linkId = 'google-fonts-customizer';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Pre-process and crop logo icon (make transparent in browser)
  useEffect(() => {
    if (!logo?.logo_url) return;
    setLoading(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logo.logo_url;
    img.onload = () => {
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;

        // Chroma-key white background to transparent in client browser
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If pixel is close to white (>= 240), make transparent
          if (r >= 240 && g >= 240 && b >= 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Find bounding box of non-transparent elements to crop whitespace
        let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
        let hasContent = false;
        for (let y = 0; y < tempCanvas.height; y++) {
          for (let x = 0; x < tempCanvas.width; x++) {
            const alpha = data[((y * tempCanvas.width) + x) * 4 + 3];
            if (alpha > 0) {
              hasContent = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const croppedCanvas = document.createElement('canvas');
        if (hasContent) {
          const cw = maxX - minX + 1;
          const ch = maxY - minY + 1;
          croppedCanvas.width = cw;
          croppedCanvas.height = ch;
          const cCtx = croppedCanvas.getContext('2d');
          cCtx.drawImage(tempCanvas, minX, minY, cw, ch, 0, 0, cw, ch);
        } else {
          croppedCanvas.width = tempCanvas.width;
          croppedCanvas.height = tempCanvas.height;
          const cCtx = croppedCanvas.getContext('2d');
          cCtx.drawImage(tempCanvas, 0, 0);
        }

        croppedLogoRef.current = croppedCanvas;
        setLoading(false);
      } catch (err) {
        console.error('Error pre-processing logo:', err);
        // Fallback to raw image if canvas manipulation fails (e.g. CORS limit)
        croppedLogoRef.current = img;
        setLoading(false);
      }
    };
    img.onerror = () => {
      setError('Failed to load logo icon image.');
      setLoading(false);
    };
  }, [logo]);

  // Real-time canvas drawing effect
  useEffect(() => {
    drawLockup();
  }, [brandName, tagline, layout, fontFamily, primaryColor, secondaryColor, fontSizeName, fontSizeTagline, gap, loading]);

  const drawLockup = () => {
    const canvas = canvasRef.current;
    const logoImg = croppedLogoRef.current;
    if (!canvas || !logoImg) return;

    const ctx = canvas.getContext('2d');
    const W = layout === 'horizontal' ? 1200 : 800;
    const H = layout === 'horizontal' ? 600 : 800;
    canvas.width = W;
    canvas.height = H;

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, W, H);

    // Dynamic Fonts mapping
    const fontMapping = {
      'Inter': 'Inter, sans-serif',
      'Montserrat': 'Montserrat, sans-serif',
      'Playfair Display': '"Playfair Display", serif',
      'Outfit': 'Outfit, sans-serif',
      'Arial': 'Arial, sans-serif',
      'Georgia': 'Georgia, serif'
    };

    const chosenFont = fontMapping[fontFamily] || 'sans-serif';

    // ─── Stacked Vertical Layout ───
    if (layout === 'vertical') {
      // 1. Calculate logo size (thumbnail fit to max 350x350 box)
      let lw = logoImg.width;
      let lh = logoImg.height;
      const maxBox = 350;
      const ratio = Math.min(maxBox / lw, maxBox / lh);
      lw = lw * ratio;
      lh = lh * ratio;

      // 2. Set fonts to calculate text dimensions
      ctx.font = `bold ${fontSizeName}px ${chosenFont}`;
      const nameHeight = parseInt(fontSizeName);

      let tagHeight = 0;
      if (tagline.trim() !== '') {
        tagHeight = parseInt(fontSizeTagline);
      }

      // 3. Compute total content height
      let totalH = lh + gap + nameHeight;
      if (tagline.trim() !== '') {
        totalH += (gap / 2) + tagHeight;
      }

      // Vertical starting position (centered vertically)
      const startY = (H - totalH) / 2;

      // Draw logo icon centered horizontally
      const lx = (W - lw) / 2;
      ctx.drawImage(logoImg, lx, startY, lw, lh);

      // Draw brand name
      ctx.font = `bold ${fontSizeName}px ${chosenFont}`;
      ctx.fillStyle = primaryColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const ny = startY + lh + gap;
      ctx.fillText(brandName, W / 2, ny);

      // Draw tagline
      if (tagline.trim() !== '') {
        ctx.font = `${fontSizeTagline}px ${chosenFont}`;
        ctx.fillStyle = secondaryColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const ty = ny + nameHeight + (gap / 2);
        ctx.fillText(tagline, W / 2, ty);
      }
    }
    // ─── Inline Horizontal Layout ───
    else {
      // 1. Calculate logo size (thumbnail fit to max 300x300 box)
      let lw = logoImg.width;
      let lh = logoImg.height;
      const maxBox = 300;
      const ratio = Math.min(maxBox / lw, maxBox / lh);
      lw = lw * ratio;
      lh = lh * ratio;

      // 2. Set fonts to calculate text widths
      ctx.font = `bold ${fontSizeName}px ${chosenFont}`;
      const nameWidth = ctx.measureText(brandName).width;
      const nameHeight = parseInt(fontSizeName);

      let tagWidth = 0;
      let tagHeight = 0;
      if (tagline.trim() !== '') {
        ctx.font = `${fontSizeTagline}px ${chosenFont}`;
        tagWidth = ctx.measureText(tagline).width;
        tagHeight = parseInt(fontSizeTagline);
      }

      const textWidth = Math.max(nameWidth, tagWidth);

      // 3. Compute total content width
      const totalW = lw + gap + textWidth;
      const startX = (W - totalW) / 2;

      // Draw logo icon centered vertically
      const ly = (H - lh) / 2;
      ctx.drawImage(logoImg, startX, ly, lw, lh);

      // Text block height
      let textBlockH = nameHeight;
      if (tagline.trim() !== '') {
        textBlockH += (gap / 2) + tagHeight;
      }
      const textStartY = (H - textBlockH) / 2;

      // Draw brand name
      ctx.font = `bold ${fontSizeName}px ${chosenFont}`;
      ctx.fillStyle = primaryColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const tx = startX + lw + gap;
      ctx.fillText(brandName, tx, textStartY);

      // Draw tagline
      if (tagline.trim() !== '') {
        ctx.font = `${fontSizeTagline}px ${chosenFont}`;
        ctx.fillStyle = secondaryColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const ty = textStartY + nameHeight + (gap / 2);
        ctx.fillText(tagline, tx, ty);
      }
    }

    // Set preview URL to the dynamic canvas data URL
    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return;

    setSaving(true);
    setError(null);
    try {
      const base64Png = canvas.toDataURL('image/png');
      const response = await api.post('/logos/lockup', {
        logoId: logo?.id || null,
        logoUrl: logo?.logo_url,
        brandName,
        tagline: tagline.trim() === '' ? undefined : tagline,
        layout,
        fontFamily,
        primaryColor,
        secondaryColor,
        fontSizeName: parseInt(fontSizeName),
        fontSizeTagline: parseInt(fontSizeTagline),
        gap: parseInt(gap),
        compiledBase64: base64Png, // Bypass Python completely by passing pre-rendered transparent image
      });

      if (response.data?.success) {
        if (onSaveSuccess) {
          onSaveSuccess(response.data.data.lockupUrl);
        }
        alert('🎉 Custom Typography Lockup saved successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Failed to save customized lockup:', err);
      setError(err.response?.data?.message || 'Failed to save lockup. Check connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `${brandName.replace(/\s+/g, '_')}_logo_lockup.png`;
    a.click();
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={modalOverlayStyle}>
      {/* Hidden offscreen canvas for rendering high-res PNG */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={modalPanelStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Logo Typography Studio</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Combine your symbol with custom text lockups</p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        {/* Studio Content */}
        <div style={bodyStyle}>
          
          {/* Controls Panel (Left) */}
          <div style={controlsPanelStyle}>
            
            {/* Input fields */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                style={inputStyle}
                placeholder="Enter Brand Name..."
              />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Tagline / Slogan (Optional)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                style={inputStyle}
                placeholder="Enter tagline..."
              />
            </div>

            {/* Layout Switcher */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Layout Format</label>
              <div style={layoutToggleGroupStyle}>
                <button
                  onClick={() => setLayout('vertical')}
                  style={layout === 'vertical' ? layoutBtnActiveStyle : layoutBtnStyle}
                >
                  Stacked (Vertical)
                </button>
                <button
                  onClick={() => setLayout('horizontal')}
                  style={layout === 'horizontal' ? layoutBtnActiveStyle : layoutBtnStyle}
                >
                  Inline (Horizontal)
                </button>
              </div>
            </div>

            {/* Font Picker */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Typography Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={selectStyle}
              >
                <option value="Inter">Clean & Minimal (Inter)</option>
                <option value="Montserrat">Modern & Trendy (Montserrat)</option>
                <option value="Playfair Display">Elegant & Luxury (Playfair Serif)</option>
                <option value="Outfit">Tech & Bold (Outfit)</option>
                <option value="Arial">Classic Standard (Sans-Serif)</option>
                <option value="Georgia">Editorial Style (Serif)</option>
              </select>
            </div>

            {/* Colors */}
            <div style={colorGridStyle}>
              <div style={sectionStyle}>
                <label style={labelStyle}>Brand Name Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={colorPickerStyle}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={colorTextInputStyle}
                  />
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Tagline Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={colorPickerStyle}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={colorTextInputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Sizes & Sliders */}
            <div style={sectionStyle}>
              <div style={sliderHeaderStyle}>
                <label style={labelStyle}>Brand Name Font Size</label>
                <span style={sliderValStyle}>{fontSizeName}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="80"
                value={fontSizeName}
                onChange={(e) => setFontSizeName(e.target.value)}
                style={sliderStyle}
              />
            </div>

            <div style={sectionStyle}>
              <div style={sliderHeaderStyle}>
                <label style={labelStyle}>Tagline Font Size</label>
                <span style={sliderValStyle}>{fontSizeTagline}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="40"
                value={fontSizeTagline}
                onChange={(e) => setFontSizeTagline(e.target.value)}
                style={sliderStyle}
              />
            </div>

            <div style={sectionStyle}>
              <div style={sliderHeaderStyle}>
                <label style={labelStyle}>Gap Spacing</label>
                <span style={sliderValStyle}>{gap}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={gap}
                onChange={(e) => setGap(e.target.value)}
                style={sliderStyle}
              />
            </div>

            {/* Save Action */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              style={saving || loading ? actionBtnDisabledStyle : actionBtnStyle}
            >
              {saving ? 'Saving Lockup...' : 'Save Customized Logo Lockup'}
            </button>

          </div>

          {/* Preview Canvas (Right) */}
          <div style={canvasPanelStyle}>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 'bold' }}>
              Real-Time Transparent Preview
            </p>
            
            <div style={canvasContainerStyle}>
              {loading && (
                <div style={canvasOverlayStyle}>
                  <div style={spinnerStyle} />
                  <p style={{ marginTop: '12px', fontSize: '13px', color: '#fff' }}>Eraser stripping background...</p>
                </div>
              )}

              {error && (
                <div style={canvasErrorOverlayStyle}>
                  <span style={{ fontSize: '32px' }}>⚠️</span>
                  <p style={{ marginTop: '8px', fontSize: '13px', color: '#ff6b6b', fontWeight: 'semibold' }}>{error}</p>
                </div>
              )}

              {previewUrl && !error && !loading && (
                <img
                  src={previewUrl}
                  alt="Lockup Preview"
                  style={previewImageStyle}
                />
              )}
            </div>

            {/* Actions */}
            <div style={canvasFooterActionsStyle}>
              <button
                onClick={handleDownload}
                disabled={!previewUrl || loading}
                style={!previewUrl ? downloadBtnDisabledStyle : downloadBtnStyle}
              >
                ⬇ Download Transparent PNG
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ─── STYLES (Vanilla CSS in JS for zero dependency reliability) ────────────────

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: 'rgba(5, 5, 15, 0.85)',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const modalPanelStyle = {
  width: '1000px',
  maxWidth: '95vw',
  height: '85vh',
  maxHeight: '900px',
  background: 'linear-gradient(135deg, #111022 0%, #15132c 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  color: '#fff',
};

const headerStyle = {
  padding: '20px 24px',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'between',
  flexShrink: 0,
};

const closeButtonStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '24px',
  width: '38px',
  height: '38px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 'auto',
  transition: 'background 0.2s',
};

const bodyStyle = {
  display: 'flex',
  flex: 1,
  minHeight: 0,
};

const controlsPanelStyle = {
  width: '400px',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  padding: '24px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const canvasPanelStyle = {
  flex: 1,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(0,0,0,0.2)',
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: '#a78bfa',
  letterSpacing: '0.05em',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#fff',
  outline: 'none',
  transition: 'border 0.2s',
};

const selectStyle = {
  background: '#1a1835',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#fff',
  outline: 'none',
  cursor: 'pointer',
};

const layoutToggleGroupStyle = {
  display: 'flex',
  gap: '8px',
};

const layoutBtnStyle = {
  flex: 1,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const layoutBtnActiveStyle = {
  flex: 1,
  background: 'linear-gradient(90deg, #7C3AED, #6D28D9)',
  border: '1px solid rgba(124, 90, 237, 0.4)',
  borderRadius: '12px',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
};

const colorGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const colorPickerStyle = {
  width: '38px',
  height: '38px',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px',
  background: 'transparent',
  cursor: 'pointer',
};

const colorTextInputStyle = {
  flex: 1,
  minWidth: 0,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '8px 10px',
  fontSize: '12px',
  color: '#fff',
  outline: 'none',
  fontFamily: 'monospace',
};

const sliderHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const sliderValStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: 'rgba(255,255,255,0.5)',
};

const sliderStyle = {
  width: '100%',
  cursor: 'pointer',
};

const actionBtnStyle = {
  background: 'linear-gradient(90deg, #7C3AED, #3B82F6)',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 20px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  marginTop: '8px',
  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
};

const actionBtnDisabledStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 20px',
  color: 'rgba(255,255,255,0.4)',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'not-allowed',
  marginTop: '8px',
};

const canvasContainerStyle = {
  flex: 1,
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  background: '#111',
  backgroundImage: 'linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const canvasOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(10,10,25,0.7)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const canvasErrorOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(20,10,10,0.95)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  padding: '24px',
  textAlign: 'center',
};

const spinnerStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '3px solid rgba(124, 58, 237, 0.2)',
  borderTopColor: '#7C3AED',
  animation: 'spin 1s linear infinite',
};

const previewImageStyle = {
  maxWidth: '90%',
  maxHeight: '90%',
  objectFit: 'contain',
  borderRadius: '8px',
};

const canvasFooterActionsStyle = {
  marginTop: '16px',
  display: 'flex',
  justifyContent: 'center',
  flexShrink: 0,
};

const downloadBtnStyle = {
  background: 'linear-gradient(90deg, #10B981, #059669)',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 30px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
};

const downloadBtnDisabledStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 30px',
  color: 'rgba(255,255,255,0.2)',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'not-allowed',
};

// Add CSS keyframe animation for the loader directly via style injection
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
