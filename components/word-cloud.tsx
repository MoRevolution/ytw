"use client"

import { useMemo } from 'react';
import WordCloud from 'react-d3-cloud';
import type { WordData } from 'react-d3-cloud';

interface WordCloudProps {
  tags: string[];
}

// Color palette similar to the example image
const COLORS = [
  '#bada55', // yellow-green
  '#ff6666', // red
  '#ffe066', // yellow
  '#666666', // gray
  '#a3e635', // light green
  '#f87171', // light red
  '#facc15', // gold
  '#64748b', // blue-gray
  '#fbbf24', // orange
  '#eab308', // dark yellow
];

// 5 orientations from -60 to 60 degrees
const ORIENTATIONS = [-60, -30, 0, 30, 60];

export function WordCloudComponent({ tags }: WordCloudProps) {
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

  // Logarithmic font size scale
  const fontSize = (word: WordData) => {
    const minSize = 18;
    const maxSize = 80;
    const minValue = Math.min(...words.map(w => w.value));
    const maxValue = Math.max(...words.map(w => w.value));
    if (minValue === maxValue) return (minSize + maxSize) / 2;
    // log scale
    const logMin = Math.log(minValue || 1);
    const logMax = Math.log(maxValue);
    const logValue = Math.log(word.value);
    return minSize + ((logValue - logMin) / (logMax - logMin)) * (maxSize - minSize);
  };

  // 5 orientations from -60 to 60
  const rotate = () => ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)];

  // Color by index (cycle through palette)
  const fill = (_word: WordData, index: number) => COLORS[index % COLORS.length];

  return (
    <div className="h-[500px] w-full flex items-center justify-center">
      <div className="w-[900px] h-[450px]">
        <WordCloud
          data={words}
          fontSize={fontSize}
          rotate={rotate}
          padding={2}
          random={Math.random}
          font="Impact"
          fontWeight="bold"
          spiral="archimedean"
          fill={fill}
        />
      </div>
    </div>
  );
} 