/**
 * Centralized mock/demo data for the YouTube Wrapped app.
 * Used for sample user mode and as fallback when real data is unavailable.
 * 
 * Single source of truth — all pages import from here instead of 
 * defining their own inline mock blocks.
 */

import type { DashboardStats, CreatorStats, CategoryStats, YearComparison } from './fetch-dashboard-data'

// ─── Shared constants ────────────────────────────────────────────

const MOCK_YEAR = 2023
const COMPARISON_YEAR = 2022

// ─── Creator data (defined once) ─────────────────────────────────

const CREATORS = {
  mkbhd:     { name: "MKBHD",            channelId: "UCBJycsmduvYEL83R_U4JriQ" },
  ltt:       { name: "Linus Tech Tips",   channelId: "UCXuqSBlHAE6Xw-yeJA0Tunw" },
  veritasium:{ name: "Veritasium",        channelId: "UCHnyfMqiRRG1u-2MsSQLbXA" },
  fireship:  { name: "Fireship",          channelId: "UCsBjURrPoezykLs9EqgamOA" },
  verge:     { name: "The Verge",         channelId: "UCddiUEpeqJcYeBxXxIVlKCA" },
} as const

function creator(
  key: keyof typeof CREATORS,
  watchTime: number,
  videoCount: number,
  normalizedScore: number
): CreatorStats {
  const c = CREATORS[key]
  return {
    name: c.name,
    channelId: c.channelId,
    watchTime,
    videoCount,
    avgVideoDuration: watchTime / videoCount,
    normalizedScore,
  }
}

// ─── Category data (defined once) ────────────────────────────────

const CATEGORIES: CategoryStats[] = [
  { name: "Gaming",        watchTime: 65.2, percentage: 32.5 },
  { name: "Tech",          watchTime: 56.8, percentage: 28.4 },
  { name: "Music",         watchTime: 36.0, percentage: 18.0 },
  { name: "Education",     watchTime: 24.0, percentage: 12.0 },
  { name: "Entertainment", watchTime: 20.0, percentage: 10.0 },
]

const COMPARISON_CATEGORIES: CategoryStats[] = [
  { name: "Tech",          watchTime: 58.8, percentage: 28.0 },
  { name: "Gaming",        watchTime: 52.5, percentage: 25.0 },
  { name: "Music",         watchTime: 42.0, percentage: 20.0 },
  { name: "Education",     watchTime: 31.5, percentage: 15.0 },
  { name: "Entertainment", watchTime: 25.2, percentage: 12.0 },
]

// ─── Most watched videos ────────────────────────────────────────

const MOST_WATCHED_VIDEOS = [
  { title: "These new computers are getting creepy… Copilot+ PC first look", channel: "Fireship",        count: 12, videoId: "hlwcZpEx2IY" },
  { title: "iPhone 16/16 Pro Review: Times Have Changed!",                   channel: "MKBHD",           count: 7,  videoId: "MRtg6A1f2Ko" },
  { title: "What 'Follow Your Dreams' Misses | Harvey Mudd Commencement",   channel: "3blue1brown",     count: 5,  videoId: "W3I3kAg2J7w" },
  { title: "Pro Climber pretends to be Old Man",                             channel: "Magnus Midtbø",   count: 4,  videoId: "I0ukVL0H4fs" },
  { title: "Turning children's glue into drinkable alcohol",                 channel: "NileRed",         count: 3,  videoId: "QzP3vx8XadU" },
]

// ─── Dashboard mock (primary + comparison year) ──────────────────

const primaryYearStats: DashboardStats = {
  watchTime: 247,
  videosWatched: 1842,
  uniqueCreators: 312,
  topCategory: "Gaming",
  topCreator: "MKBHD",
  year: MOCK_YEAR,
  isComplete: true,
  topCreators: [
    creator("mkbhd",      42.3, 85, 42.5),
    creator("ltt",         38.7, 78, 39.0),
    creator("veritasium",  29.5, 60, 30.0),
    creator("fireship",    24.8, 50, 25.0),
    creator("verge",       20.1, 45, 22.5),
  ],
  monthlyVideoCounts: [120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
  monthlyWatchTime:   [12.5, 15.2, 18.7, 20.3, 22.1, 24.5, 26.8, 28.9, 30.2, 32.4, 34.7, 36.9],
  categoryStats: CATEGORIES,
  mostWatchedVideos: MOST_WATCHED_VIDEOS,
  longestSession: {
    duration: 4.5,
    date: "2023-07-15T14:30:00Z",
    category: "Gaming",
    videos: [
      { title: "Minecraft Speedrun World Record",    channel: "Dream",      videoId: "dQw4w9WgXcQ", likeCount: 1500000, duration: "1:23:45" },
      { title: "Minecraft Building Tips and Tricks", channel: "Grian",      videoId: "dQw4w9WgXcQ", likeCount: 800000,  duration: "45:30"   },
      { title: "Minecraft Redstone Tutorial",        channel: "Mumbo Jumbo", videoId: "dQw4w9WgXcQ", likeCount: 600000,  duration: "1:15:20" },
    ],
  },
  tags: ["gaming", "tech", "tutorial", "review", "news", "music", "vlog", "coding", "react", "javascript", "python", "ai", "machine learning", "web development"],
}

const comparisonYearStats: DashboardStats = {
  watchTime: 210,
  videosWatched: 1500,
  uniqueCreators: 290,
  topCategory: "Tech",
  topCreator: "Linus Tech Tips",
  year: COMPARISON_YEAR,
  isComplete: true,
  topCreators: [
    creator("ltt",         45.2, 90, 45.0),
    creator("mkbhd",       35.8, 70, 35.0),
    creator("verge",       28.3, 55, 27.5),
    creator("veritasium",  25.6, 50, 25.0),
    creator("fireship",    22.4, 45, 22.5),
  ],
  monthlyVideoCounts: [100, 130, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340],
  monthlyWatchTime:   [10.2, 13.5, 16.8, 18.2, 20.1, 22.4, 24.7, 26.8, 28.9, 30.2, 32.4, 34.6],
  categoryStats: COMPARISON_CATEGORIES,
  mostWatchedVideos: MOST_WATCHED_VIDEOS,
  longestSession: { duration: 0, date: "", category: "", videos: [] },
  tags: ["tech", "gaming", "music", "education", "entertainment", "tutorial", "review", "news", "vlog", "coding"],
}

export const mockDashboardStats: YearComparison = {
  primaryYear: primaryYearStats,
  comparisonYear: comparisonYearStats,
}

// ─── Watch Time mock ─────────────────────────────────────────────

export const mockWatchTimeStats = {
  totalWatchTime: 247,
  averageDailyWatchTime: 0.68,
  averageVideoLength: 0.135,
  year: MOCK_YEAR + 1,
  dailyWatchTime: Array.from({ length: 365 }, (_, i) => ({
    date: new Date(MOCK_YEAR + 1, 0, i + 1).toISOString().split('T')[0],
    watchTime: Math.random() * 2,
  })),
  videoLengthDistribution: [
    { length: "0-5 min",   count: 450 },
    { length: "5-10 min",  count: 620 },
    { length: "10-15 min", count: 380 },
    { length: "15-20 min", count: 250 },
    { length: "20-30 min", count: 180 },
    { length: "30+ min",   count: 120 },
  ],
  weeklyPatterns: [
    { dayOfWeek: "Sunday",    averageWatchTime: 75 },
    { dayOfWeek: "Monday",    averageWatchTime: 35 },
    { dayOfWeek: "Tuesday",   averageWatchTime: 38 },
    { dayOfWeek: "Wednesday", averageWatchTime: 35 },
    { dayOfWeek: "Thursday",  averageWatchTime: 40 },
    { dayOfWeek: "Friday",    averageWatchTime: 45 },
    { dayOfWeek: "Saturday",  averageWatchTime: 68 },
  ],
  dailyPatterns: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    averageWatchTime: [10, 5, 3, 2, 1, 2, 5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 60, 30][hour],
  })),
  previousYearStats: {
    averageDailyWatchTime: 0.55,
    averageVideoLength: 0.12,
    year: MOCK_YEAR,
  },
  milestones: {
    longestSingleDay: { date: `${MOCK_YEAR + 1}-07-15`, watchTime: 5.2, videoCount: 14, category: "24" },
    mostActiveMonth:  { month: `${MOCK_YEAR + 1}-08`, watchTime: 40, videoCount: 230, increaseFromAverage: 28 },
    longestSession:   { date: `${MOCK_YEAR + 1}-10-08`, duration: 3.5, category: "28" },
    totalHoursMilestone: { hours: 250, date: `${MOCK_YEAR + 1}-12-28` },
  },
}

// ─── Categories mock ─────────────────────────────────────────────

export const mockCategoryData = {
  year: MOCK_YEAR + 1,
  totalWatchTime: 247,
  categoryDistribution: [
    {
      categoryId: "20", watchTime: 79, videoCount: 320, percentage: 32,
      topVideos: [
        { videoId: "abc123", title: "Minecraft Hardcore Survival: Day 1000", channelTitle: "PewDiePie",      watchCount: 14, duration: 3600 },
        { videoId: "def456", title: "Fortnite Chapter 4 Season 2: Gameplay", channelTitle: "Ninja",          watchCount: 9,  duration: 1800 },
        { videoId: "ghi789", title: "League of Legends: Pro Tips and Tricks", channelTitle: "Faker",          watchCount: 7,  duration: 2400 },
      ],
    },
    {
      categoryId: "28", watchTime: 69, videoCount: 280, percentage: 28,
      topVideos: [
        { videoId: "jkl012", title: "iPhone 15 Pro: Honest Review",                   channelTitle: "MKBHD",           watchCount: 11, duration: 2700 },
        { videoId: "mno345", title: "The Ultimate Guide to Next.js 13 App Router",    channelTitle: "Fireship",        watchCount: 8,  duration: 1500 },
        { videoId: "pqr678", title: "Building a $5000 Gaming PC",                     channelTitle: "Linus Tech Tips", watchCount: 6,  duration: 2100 },
      ],
    },
    {
      categoryId: "10", watchTime: 44, videoCount: 180, percentage: 18,
      topVideos: [
        { videoId: "stu901", title: "Top 100 Songs of 2024",         channelTitle: "InTheMix", watchCount: 15, duration: 4500 },
        { videoId: "vwx234", title: "Making a Song in One Hour",     channelTitle: "Andrew Huang", watchCount: 9, duration: 3600 },
        { videoId: "yza567", title: "How Music Theory Really Works", channelTitle: "Adam Neely", watchCount: 7, duration: 2700 },
      ],
    },
    {
      categoryId: "27", watchTime: 30, videoCount: 120, percentage: 12,
      topVideos: [
        { videoId: "bcd890", title: "The Map of Mathematics",        channelTitle: "Domain of Science",  watchCount: 8, duration: 3000 },
        { videoId: "efg123", title: "How the Universe Works",        channelTitle: "Kurzgesagt",         watchCount: 6, duration: 2400 },
        { videoId: "hij456", title: "Why Most People Never Succeed", channelTitle: "Veritasium",         watchCount: 5, duration: 1800 },
      ],
    },
    {
      categoryId: "24", watchTime: 25, videoCount: 100, percentage: 10,
      topVideos: [
        { videoId: "klm789", title: "I Spent 50 Hours in Solitary Confinement", channelTitle: "MrBeast",      watchCount: 12, duration: 1200 },
        { videoId: "nop012", title: "World's Most Expensive House Tour",        channelTitle: "JiDion",       watchCount: 8,  duration: 1500 },
        { videoId: "qrs345", title: "Ultimate Try Not to Laugh Challenge",      channelTitle: "Markiplier",   watchCount: 6,  duration: 1800 },
      ],
    },
  ],
  categoryComparison: [
    { categoryId: "20", currentYear: { watchTime: 79, percentage: 32 }, previousYear: { watchTime: 65, percentage: 30 }, change: 2 },
    { categoryId: "28", currentYear: { watchTime: 69, percentage: 28 }, previousYear: { watchTime: 72, percentage: 33 }, change: -5 },
    { categoryId: "10", currentYear: { watchTime: 44, percentage: 18 }, previousYear: { watchTime: 39, percentage: 18 }, change: 0 },
    { categoryId: "27", currentYear: { watchTime: 30, percentage: 12 }, previousYear: { watchTime: 24, percentage: 11 }, change: 1 },
    { categoryId: "24", currentYear: { watchTime: 25, percentage: 10 }, previousYear: { watchTime: 17, percentage: 8 },  change: 2 },
  ],
  monthlyBreakdown: [
    { month: "Jan",  "20": 5.2, "28": 6.1,  "10": 3.5, "27": 2.0, "24": 1.8 },
    { month: "Feb",  "20": 4.8, "28": 5.5,  "10": 3.2, "27": 2.3, "24": 1.5 },
    { month: "Mar",  "20": 6.0, "28": 5.8,  "10": 3.8, "27": 2.5, "24": 2.0 },
    { month: "Apr",  "20": 5.5, "28": 6.2,  "10": 4.0, "27": 2.8, "24": 1.9 },
    { month: "May",  "20": 7.2, "28": 5.0,  "10": 3.5, "27": 2.2, "24": 2.5 },
    { month: "Jun",  "20": 8.5, "28": 4.8,  "10": 3.0, "27": 1.8, "24": 3.2 },
    { month: "Jul",  "20": 9.8, "28": 4.5,  "10": 2.8, "27": 1.5, "24": 3.8 },
    { month: "Aug",  "20": 10.2, "28": 5.2, "10": 3.0, "27": 2.0, "24": 3.5 },
    { month: "Sep",  "20": 6.5, "28": 7.5,  "10": 4.5, "27": 4.2, "24": 2.0 },
    { month: "Oct",  "20": 6.0, "28": 6.8,  "10": 5.0, "27": 3.5, "24": 1.2 },
    { month: "Nov",  "20": 5.2, "28": 5.8,  "10": 4.5, "27": 2.8, "24": 0.8 },
    { month: "Dec",  "20": 4.1, "28": 5.8,  "10": 3.2, "27": 2.4, "24": 0.8 },
  ],
}

// ─── Creators page mock (discovery/loyalty/engagement — demo only) ──

export const mockCreatorPageData = {
  discovery: {
    q1: [
      { name: "Kurzgesagt",          category: "Educational",  date: "Jan 15", channelId: "UCsXVk37bltHxD1rDPwtNM8Q" },
      { name: "Fireship",            category: "Programming",  date: "Feb 3",  channelId: CREATORS.fireship.channelId },
    ],
    q2: [
      { name: "Web Dev Simplified",  category: "Programming",  date: "Apr 22", channelId: "UCFbNIlppjAuEX4znoulh0Cw" },
      { name: "Binging with Babish", category: "Cooking",      date: "May 17", channelId: "UCJHA_jMfCvEnv-3kRjTCQXw" },
    ],
    q3: [
      { name: "Dream",               category: "Gaming",       date: "Jul 8",  channelId: "UCTkXRDQl0luXxVQrRQvWS6w" },
      { name: "Traversy Media",      category: "Programming",  date: "Aug 29", channelId: "UC29ju8bIPH5as8OGnQzwJyA" },
    ],
    q4: [
      { name: "TED-Ed",              category: "Educational",  date: "Oct 12", channelId: "UCsooa4yRKGN_zEE8iknghZA" },
      { name: "Theo - t3.gg",        category: "Programming",  date: "Nov 5",  channelId: "UCbRP3c757lWg9M-U7TyEkXA" },
    ],
  },
  loyalty: [
    { name: "MKBHD",      percentage: 95, watched: 38, total: 40, channelId: CREATORS.mkbhd.channelId },
    { name: "Veritasium", percentage: 88, watched: 22, total: 25, channelId: CREATORS.veritasium.channelId },
    { name: "Fireship",   percentage: 75, watched: 45, total: 60, channelId: CREATORS.fireship.channelId },
  ],
  engagement: {
    mostLiked:     { name: "MKBHD",      count: 35, channelId: CREATORS.mkbhd.channelId },
    mostCommented: { name: "Fireship",    count: 12, channelId: CREATORS.fireship.channelId },
    mostShared:    { name: "Veritasium",  count: 8,  channelId: CREATORS.veritasium.channelId },
  },
}

// ─── Shared summary stats (header fallback, profile page) ────────

export const mockSummaryStats = {
  watchTime: 247,
  videosWatched: 1842,
  uniqueCreators: 312,
  topCategory: "Gaming",
  topCreator: "MKBHD",
}
