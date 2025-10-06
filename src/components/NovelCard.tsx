import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Novel } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
interface NovelCardProps {
  novel: Novel;
}
export function NovelCard({ novel }: NovelCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Link to={`/novel/${novel.slug}`} className="block h-full">
        <Card className="h-full overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 flex flex-col">
          <AspectRatio ratio={3 / 4} className="relative">
            {!isImageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <img
              src={novel.coverImageUrl}
              alt={novel.title}
              className={cn(
                "object-cover w-full h-full transition-opacity duration-500",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
            />
          </AspectRatio>
          <CardContent className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-base leading-tight truncate text-foreground" title={novel.title}>
                {novel.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{novel.author}</p>
            </div>
            {novel.latestChapter && (
              <p className="text-xs text-muted-foreground mt-2">
                Chapter {novel.latestChapter}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}