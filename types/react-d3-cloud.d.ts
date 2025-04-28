declare module 'react-d3-cloud' {
  export interface WordData {
    text: string;
    value: number;
  }

  export interface WordCloudProps {
    data: WordData[];
    fontSize?: (word: WordData) => number;
    rotate?: () => number;
    padding?: number;
    random?: () => number;
    onWordClick?: (word: WordData) => void;
    font?: string;
    fontWeight?: string | number;
    spiral?: string;
    fill?: (word: WordData, index: number) => string;
  }

  const WordCloud: React.FC<WordCloudProps>;
  export default WordCloud;
} 