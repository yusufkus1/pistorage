export default function Breadcrumb({ path, onNavigate }) {
  const parts = path ? path.split('/').filter(Boolean) : [];

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-600 overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => onNavigate('')}
        className="hover:text-blue-600 font-medium transition-colors"
      >
        Ana Dizin
      </button>
      {parts.map((part, i) => {
        const partPath = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={partPath} className="flex items-center gap-1">
            <span className="text-slate-400">/</span>
            <button
              onClick={() => onNavigate(partPath)}
              className={`hover:text-blue-600 transition-colors ${isLast ? 'text-slate-800 font-semibold' : ''}`}
            >
              {part}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
