"use client"

import { useMemo } from 'react';
import WordCloud from 'react-d3-cloud';
import type { WordData } from 'react-d3-cloud';

interface WordCloudProps {
  tags: string[];
}

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
      .slice(0, 100); // Limit to top 100 words
  }, [wordFrequencies]);

  // Calculate font size based on word frequency
  const fontSize = (word: WordData) => {
    const minSize = 12;
    const maxSize = 60;
    const minValue = Math.min(...words.map(w => w.value));
    const maxValue = Math.max(...words.map(w => w.value));
    
    return minSize + ((word.value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
  };

  // Random rotation between -45 and 45 degrees
  const rotate = () => Math.random() * 90 - 45;

  return (
    <div className="h-[400px] w-full">
      <WordCloud
        data={words}
        fontSize={fontSize}
        rotate={rotate}
        padding={5}
        random={Math.random}
        onWordClick={(word) => console.log(`Clicked on ${word.text}`)}
        font="Inter"
        fontWeight="bold"
        spiral="archimedean"
        fill={(word: WordData, index: number) => {
          // Generate a color based on the word's index
          const hue = (index * 137.508) % 360; // Golden angle
          return `hsl(${hue}, 70%, 50%)`;
        }}
      />
    </div>
  );
} 