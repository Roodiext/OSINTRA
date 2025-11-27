import React from 'react';

interface Props {
  title: string;
  divisions?: string[];
  date?: string;
  status?: 'planned' | 'ongoing' | 'done';
  thumbnail?: string;
}

const statusClasses = {
  planned: 'bg-secondary/10 text-secondary',
  ongoing: 'bg-accent/10 text-accent',
  done: 'bg-green-100 text-green-800',
};

const ProgramCard: React.FC<Props> = ({ title, divisions = [], date, status = 'planned', thumbnail }) => {
  return (
    <article className="bg-white rounded-lg-2 shadow-soft overflow-hidden transition transform hover:-translate-y-1">
      {thumbnail && <img src={thumbnail} alt={title} className="w-full h-44 object-cover" />}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <span className={`text-sm px-2 py-1 rounded-full ${statusClasses[status]}`}>{status}</span>
        </div>
        <p className="text-sm text-secondary mt-2">{divisions.join(', ')}</p>
        {date && <p className="text-sm text-secondary mt-2">{new Date(date).toLocaleDateString('id-ID')}</p>}
      </div>
    </article>
  );
};

export default ProgramCard;
