"use client"

import { useMemo, useCallback } from 'react';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 36;
const MIN_FONT_WEIGHT = 300;
const MAX_FONT_WEIGHT = 700;
const MAX_WORDS = 50;

interface Word {
  text: string;
  value: number;
}

interface WordCloudProps {
  tags: string[];
}

export function WordCloud({ tags }: WordCloudProps) {
  // Process tags into word frequencies
  const wordFrequencies = useMemo(() => {
    const frequencies: Record<string, number> = {};
    
    tags.forEach(tag => {
      frequencies[tag] = (frequencies[tag] || 0) + 1;
    });
    
    return frequencies;
  }, [tags]);

  // Convert frequencies to word objects and sort
  const sortedWords = useMemo(() => {
    return Object.entries(wordFrequencies)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, MAX_WORDS);
  }, [wordFrequencies]);

  // Calculate min and max occurrences
  const [minOccurences, maxOccurences] = useMemo(() => {
    if (sortedWords.length === 0) return [0, 0];
    const min = Math.min(...sortedWords.map((w) => w.value));
    const max = Math.max(...sortedWords.map((w) => w.value));
    return [min, max];
  }, [sortedWords]);

  // Calculate font size based on word frequency
  const calculateFontSize = useCallback(
    (wordOccurrences: number) => {
      if (minOccurences === maxOccurences) return (MIN_FONT_SIZE + MAX_FONT_SIZE) / 2;
      const normalizedValue = (wordOccurrences - minOccurences) / (maxOccurences - minOccurences);
      const fontSize = MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE);
      return Math.round(fontSize);
    },
    [maxOccurences, minOccurences]
  );

  // Calculate font weight based on word frequency
  const calculateFontWeight = useCallback(
    (wordOccurrences: number) => {
      if (minOccurences === maxOccurences) return (MIN_FONT_WEIGHT + MAX_FONT_WEIGHT) / 2;
      const normalizedValue = (wordOccurrences - minOccurences) / (maxOccurences - minOccurences);
      const fontWeight = MIN_FONT_WEIGHT + normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT);
      return Math.round(fontWeight);
    },
    [maxOccurences, minOccurences]
  );

  if (sortedWords.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No tags available
      </div>
    );
  }

  return (
    <div className="flex h-64 flex-wrap items-center justify-center gap-2 p-4">
      {sortedWords.map((word) => {
        const fontSize = calculateFontSize(word.value);
        const fontWeight = calculateFontWeight(word.value);
        
        return (
          <span
            key={word.text}
            className="inline-block cursor-pointer transition-all hover:scale-110"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight,
              opacity: 0.7 + (word.value / maxOccurences) * 0.3,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
} 