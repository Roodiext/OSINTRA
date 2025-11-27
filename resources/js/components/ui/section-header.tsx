import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, centered = false }) => {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-text">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-secondary text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div className={`mt-4 ${centered ? 'flex justify-center' : ''}`}>
        <div className="w-24 h-1 bg-accent/10 rounded-full" />
      </div>
    </div>
  );
};

export default SectionHeader;
