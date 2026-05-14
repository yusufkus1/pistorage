export default function Breadcrumb({ path, onNavigate }) {
  const parts = path ? path.split('/').filter(Boolean) : [];

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => onNavigate('')}
        className={`transition-colors ${parts.length === 0 ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
      >
        Ana Dizin
      </button>
      {parts.map((part, i) => {
        const partPath = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={partPath} className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 4 10 8 6 12"/>
            </svg>
            <button
              onClick={() => onNavigate(partPath)}
              className={`transition-colors ${isLast ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {part}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
