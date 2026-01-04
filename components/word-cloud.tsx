"use client"

import { useMemo, useState, useEffect, useRef } from 'react';
import WordCloud from 'react-d3-cloud';
import type { WordData } from 'react-d3-cloud';

interface WordCloudProps {
  tags: string[];
}

// Color palette - vibrant but readable
const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
];

// Orientations for visual interest
const ORIENTATIONS = [-45, -30, 0, 30, 45];

export function WordCloudComponent({ tags }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.min(400, Math.max(300, width * 0.5));
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  // Process tags into word frequencies
  const wordFrequencies = useMemo(() => {
    const frequencies: Record<string, number> = {};
    tags.forEach(tag => {
      frequencies[tag] = (frequencies[tag] || 0) + 1;
    });
    return frequencies;
  }, [tags]);

  // Convert frequencies to word objects and sort
  const words = useMemo(() => {
    return Object.entries(wordFrequencies)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 250); // Show up to 250 words
  }, [wordFrequencies]);

  // Logarithmic font size scale - adjusted for container size
  const fontSize = (word: WordData) => {
    const scaleFactor = dimensions.width / 800;
    const minSize = Math.max(12, 16 * scaleFactor);
    const maxSize = Math.max(32, 60 * scaleFactor);
    const minValue = Math.min(...words.map(w => w.value));
    const maxValue = Math.max(...words.map(w => w.value));
    if (minValue === maxValue) return (minSize + maxSize) / 2;
    const logMin = Math.log(minValue || 1);
    const logMax = Math.log(maxValue);
    const logValue = Math.log(word.value);
    return minSize + ((logValue - logMin) / (logMax - logMin)) * (maxSize - minSize);
  };

  const rotate = () => ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)];
  const fill = (_word: WordData, index: number) => COLORS[index % COLORS.length];

  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No tags available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: dimensions.height }}>
      <WordCloud
        data={words}
        width={dimensions.width}
        height={dimensions.height}
        fontSize={fontSize}
        rotate={rotate}
        padding={3}
        random={Math.random}
        font="system-ui"
        fontWeight="600"
        spiral="archimedean"
        fill={fill}
      />
    </div>
  );
} 