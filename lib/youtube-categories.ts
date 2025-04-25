export interface YouTubeCategory {
  id: string;
  title: string;
}

export const youtubeCategories: Record<string, YouTubeCategory> = {
  "1": {
    id: "1",
    title: "Film & Animation",
  },
  "2": {
    id: "2",
    title: "Autos & Vehicles",
  },
  "10": {
    id: "10",
    title: "Music",
  },
  "15": {
    id: "15",
    title: "Pets & Animals",
  },
  "17": {
    id: "17",
    title: "Sports",
  },
  "18": {
    id: "18",
    title: "Short Movies",
  },
  "19": {
    id: "19",
    title: "Travel & Events",
  },
  "20": {
    id: "20",
    title: "Gaming",
  },
  "21": {
    id: "21",
    title: "Videoblogging",
  },
  "22": {
    id: "22",
    title: "People & Blogs",
  },
  "23": {
    id: "23",
    title: "Comedy",
  },
  "24": {
    id: "24",
    title: "Entertainment",
  },
  "25": {
    id: "25",
    title: "News & Politics",
  },
  "26": {
    id: "26",
    title: "Howto & Style",
  },
  "27": {
    id: "27",
    title: "Education",
  },
  "28": {
    id: "28",
    title: "Science & Technology",
  },
  "29": {
    id: "29",
    title: "Nonprofits & Activism",
  },
  "30": {
    id: "30",
    title: "Movies",
  },
  "31": {
    id: "31",
    title: "Anime/Animation",
  },
  "32": {
    id: "32",
    title: "Action/Adventure",
  },
  "33": {
    id: "33",
    title: "Classics",
  },
  "34": {
    id: "34",
    title: "Comedy",
  },
  "35": {
    id: "35",
    title: "Documentary",
  },
  "36": {
    id: "36",
    title: "Drama",
  },
  "37": {
    id: "37",
    title: "Family",
  },
  "38": {
    id: "38",
    title: "Foreign",
  },
  "39": {
    id: "39",
    title: "Horror",
  },
  "40": {
    id: "40",
    title: "Sci-Fi/Fantasy",
  },
  "41": {
    id: "41",
    title: "Thriller",
  },
  "42": {
    id: "42",
    title: "Shorts",
  },
  "43": {
    id: "43",
    title: "Shows",
  },
  "44": {
    id: "44",
    title: "Trailers",
  }
};

export function getCategoryName(categoryId: string): string {
  return youtubeCategories[categoryId]?.title || "Unknown";
} 