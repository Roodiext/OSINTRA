import React from 'react';

interface Props {
  name: string;
  role?: string;
  quote: string;
  photo?: string;
}

const TestimonialCard: React.FC<Props> = ({ name, role, quote, photo }) => {
  return (
    <div className="bg-white p-6 rounded-lg-2 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          {photo ? <img src={photo} alt={`${name} photo`} className="w-full h-full object-cover" /> : <div className="text-accent font-semibold">{name?.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>}
        </div>
        <div>
          <p className="text-text font-semibold">{name}</p>
          {role && <p className="text-secondary text-sm">{role}</p>}
        </div>
      </div>
      <blockquote className="mt-4 text-secondary">“{quote}”</blockquote>
    </div>
  );
};

export default TestimonialCard;
