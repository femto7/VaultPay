"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={title}
        className="w-full h-52 object-cover"
      />
    );
  }

  return (
    <div className="relative w-full h-52 group overflow-hidden">
      {images.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`${title} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      ))}

      <button
        onClick={(e) => { e.preventDefault(); setCurrent((current - 1 + images.length) % images.length); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      <button
        onClick={(e) => { e.preventDefault(); setCurrent((current + 1) % images.length); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); setCurrent(i); }}
            className={`rounded-full transition-all duration-200 ${
              i === current ? "bg-white w-4 h-1.5" : "bg-white/40 w-1.5 h-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
