import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HexColorPicker } from 'react-colorful';
import { Save, Eye, Palette } from 'lucide-react';
import { api } from '../../api/client';
import { useTenantStore } from '../../stores/tenantStore';
import { toast } from '../../components/ui/Toast';

interface ColorField {
  key: string;
  label: string;
}

const COLOR_FIELDS: ColorField[] = [
  { key: 'primary_color', label: 'Primary Color' },
  { key: 'secondary_color', label: 'Secondary Color' },
  { key: 'accent_color', label: 'Accent / Gold' },
  { key: 'background_color', label: 'Background' },
  { key: 'surface_color', label: 'Surface / Cards' },
  { key: 'text_primary', label: 'Text Primary' },
  { key: 'nav_background', label: 'Navbar Background' },
  { key: 'footer_background', label: 'Footer Background' },
];

const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat',
  'Playfair Display', 'Lora', 'Merriweather', 'Source Sans Pro', 'DM Sans',
];

export function ThemeCustomizer() {
  const { theme, applyTheme } = useTenantStore();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({
    primary_color: theme?.primary_color || '#004274',
    secondary_color: theme?.secondary_color || '#0a6abf',
    accent_color: theme?.accent_color || '#C9A974',
    background_color: theme?.background_color || '#ffffff',
    surface_color: theme?.surface_color || '#f8fafc',
    text_primary: theme?.text_primary || '#1e293b',
    nav_background: theme?.nav_background || '#004274',
    footer_background: theme?.footer_background || '#002d52',
    font_family_heading: theme?.font_family_heading || 'Inter',
    font_family_body: theme?.font_family_body || 'Inter',
    border_radius_base: theme?.border_radius_base || '8px',
    nav_style: theme?.nav_style || 'solid',
    custom_css: theme?.custom_css || '',
  });
  const [activeColorKey, setActiveColorKey] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const update = (key: string, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Live preview via postMessage
      previewRef.current?.contentWindow?.postMessage({
        type: 'THEME_UPDATE',
        vars: buildCssVars(next),
      }, '*');
      return next;
    });
  };

  const buildCssVars = (v: Record<string, string>) => ({
    '--color-primary': v.primary_color,
    '--color-secondary': v.secondary_color,
    '--color-accent': v.accent_color,
    '--color-bg': v.background_color,
    '--color-surface': v.surface_color,
    '--color-text': v.text_primary,
    '--color-nav-bg': v.nav_background,
    '--color-footer-bg': v.footer_background,
    '--font-heading': v.font_family_heading,
    '--font-body': v.font_family_body,
  });

  const saveMut = useMutation({
    mutationFn: () => api.put('/themes/', values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['theme'] });
      if (theme) applyTheme({ ...theme, ...values, css_vars: buildCssVars(values) });
      toast.success('Theme saved! Changes are now live.');
    },
    onError: () => toast.error('Failed to save theme.'),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={24} color="var(--color-accent)" />
            Theme Customizer
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Change colors, fonts, and more. Your site updates live.
          </p>
        </div>
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
        >
          <Save size={16} />
          {saveMut.isPending ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Colors */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Colors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setActiveColorKey(activeColorKey === key ? null : key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${activeColorKey === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer', background: 'var(--color-bg)',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: values[key] || '#ccc',
                      border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{values[key]}</p>
                    </div>
                  </div>
                  {activeColorKey === key && (
                    <div style={{
                      position: 'absolute', left: 0, top: '100%', zIndex: 100,
                      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: '1rem', boxShadow: 'var(--shadow-xl)',
                      marginTop: '0.5rem',
                    }}>
                      <HexColorPicker
                        color={values[key]}
                        onChange={(c) => update(key, c)}
                      />
                      <input
                        value={values[key]}
                        onChange={(e) => update(key, e.target.value)}
                        style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Typography</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'font_family_heading', label: 'Heading Font' },
                { key: 'font_family_body', label: 'Body Font' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>{label}</label>
                  <select value={values[key]} onChange={(e) => update(key, e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontFamily: values[key] }}>
                    {FONT_OPTIONS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>Border Radius</label>
                <select value={values.border_radius_base} onChange={(e) => update('border_radius_base', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}>
                  {['4px', '6px', '8px', '12px', '16px', '24px'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Custom CSS</h3>
            <textarea
              value={values.custom_css}
              onChange={(e) => update('custom_css', e.target.value)}
              placeholder="/* Add custom CSS overrides... */"
              rows={6}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
            />
          </div>
        </div>

        {/* Right: live preview */}
        <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 80 }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Live Preview</span>
          </div>
          <iframe
            ref={previewRef}
            src="/"
            style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
            title="Theme preview"
          />
        </div>
      </div>
    </div>
  );
}
