export function Avatar({ src, alt, fallback }) {
    return (
      <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-500">
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`absolute inset-0 bg-purple-600 text-white flex items-center justify-center text-sm font-medium ${src ? 'hidden' : ''}`}
        >
          {fallback}
        </div>
      </div>
    )
  }
  
  