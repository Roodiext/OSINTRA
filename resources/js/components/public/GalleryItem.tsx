import React from 'react';
import type { ProkerMedia } from '@/types';

interface Props {
  item: ProkerMedia;
  onOpen?: (item: ProkerMedia) => void;
}

const GalleryItem: React.FC<Props> = ({ item, onOpen }) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => onOpen?.(item)}>
      {item.media_type === 'image' ? (
        <img src={item.media_url} alt={item.caption || 'Gallery image'} className="w-full h-48 object-cover transform group-hover:scale-105 transition" />
      ) : (
        <div className="w-full h-48 bg-secondary/10 flex items-center justify-center">
          <div className="text-secondary">Video</div>
        </div>
      )}
      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-sm">
          {item.caption}
        </div>
      )}
    </div>
  );
};

export default GalleryItem;
