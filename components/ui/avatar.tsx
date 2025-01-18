'use client';

import Image from 'next/image';
import { getR2ImageUrl } from '@/lib/r2';
import { useEffect, useState } from 'react';

interface GroupAvatarProps {
  photo?: { path?: string };
  name: string;
  size?: number;
}

export function GroupAvatar({ photo, name, size = 32 }: GroupAvatarProps) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    async function loadImageUrl() {
      if (photo?.path) {
        const url = await getR2ImageUrl(photo.path);
        setImageUrl(url);
      }
    }
    loadImageUrl();
  }, [photo]);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (imageUrl) {
    return (
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted text-muted-foreground"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-medium">{initials}</span>
    </div>
  );
}
