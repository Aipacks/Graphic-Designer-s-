
import React, { useState } from 'react';
import { Color } from '../../types';

interface ColorSwatchProps {
  color: Color;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center text-center group">
      <div
        className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 border-4 border-surface shadow-md cursor-pointer transition-transform group-hover:scale-110"
        style={{ backgroundColor: color.hex }}
        onClick={handleCopy}
      />
      <h3 className="font-semibold text-text">{color.name}</h3>
      <p className="text-sm text-muted cursor-pointer" onClick={handleCopy}>
        {copied ? 'Copied!' : color.hex}
      </p>
    </div>
  );
};
