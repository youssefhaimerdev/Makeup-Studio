"use client";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="font-serif text-xl text-nude-700 mb-2">{title}</h3>
      <p className="text-nude-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
