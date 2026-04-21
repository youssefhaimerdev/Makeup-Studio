"use client";

export function ButtonPrimary({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonSecondary({ children, onClick, className = "" }) {
  return (
    <button onClick={onClick} className={`btn-secondary ${className}`}>
      {children}
    </button>
  );
}

export function ButtonGhost({ children, onClick, active = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition-all duration-150 border
        ${active
          ? "bg-rose-50 border-rose-300 text-rose-600 font-semibold"
          : "bg-transparent border-nude-100 text-nude-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        } ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonTab({ children, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2.5 text-sm cursor-pointer border-b-2 transition-all duration-150 font-medium
        ${active
          ? "border-rose-400 text-rose-600"
          : "border-transparent text-nude-500 hover:text-nude-700"
        }`}
    >
      {children}
    </button>
  );
}
