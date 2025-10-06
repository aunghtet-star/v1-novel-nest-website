import type { Genre, Novel, Chapter, User, Bookmark, Like, View } from './types';
export const MOCK_GENRES: Genre[] = [
  { id: 'fantasy', name: 'Fantasy', slug: 'fantasy' },
  { id: 'romance', name: 'Romance', slug: 'romance' },
  { id: 'xianxia', name: 'Xianxia', slug: 'xianxia' },
  { id: 'sci-fi', name: 'Sci-Fi', slug: 'sci-fi' },
  { id: 'action', name: 'Action', slug: 'action' },
];
const LOREM_IPSUM_SUMMARY = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
const LOREM_IPSUM_CONTENT = Array(20).fill(LOREM_IPSUM_SUMMARY).join('\n\n');
export const MOCK_LIKES: Like[] = [
  { id: 'user-1-eternal-cultivation', userId: 'user-1', novelSlug: 'eternal-cultivation' },
  { id: 'user-1-the-last-dragon', userId: 'user-1', novelSlug: 'the-last-dragon' },
  { id: 'user-1-renegade-immortal', userId: 'user-1', novelSlug: 'renegade-immortal' },
];
export const MOCK_VIEWS: View[] = [
  { id: 'user-1-eternal-cultivation', userId: 'user-1', novelSlug: 'eternal-cultivation' },
  { id: 'user-1-shadow-empress', userId: 'user-1', novelSlug: 'shadow-empress' },
  { id: 'user-1-the-last-dragon', userId: 'user-1', novelSlug: 'the-last-dragon' },
  { id: 'user-1-renegade-immortal', userId: 'user-1', novelSlug: 'renegade-immortal' },
  { id: 'user-1-void-walker', userId: 'user-1', novelSlug: 'void-walker' },
];
const baseNovels: Omit<Novel, 'likeCount' | 'viewCount'>[] = [
  { id: 'eternal-cultivation', slug: 'eternal-cultivation', title: 'Eternal Cultivation', author: 'SkyBlade', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/1a202c/a0aec0?text=Eternal%0ACultivation', summary: LOREM_IPSUM_SUMMARY, genres: ['xianxia', 'action'], status: 'Ongoing', rating: 4.8, latestChapter: 20, updatedAt: new Date().toISOString(), moderationStatus: 'pending' },
  { id: 'shadow-empress', slug: 'shadow-empress', title: 'Shadow Empress', author: 'Moonlight', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/2d3748/e2e8f0?text=Shadow%0AEmpress', summary: LOREM_IPSUM_SUMMARY, genres: ['fantasy', 'romance'], status: 'Ongoing', rating: 4.9, latestChapter: 15, updatedAt: new Date(Date.now() - 86400000).toISOString(), moderationStatus: 'pending' },
  { id: 'galactic-odyssey', slug: 'galactic-odyssey', title: 'Galactic Odyssey', author: 'StarGazer', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/4a5568/a0aec0?text=Galactic%0AOdyssey', summary: LOREM_IPSUM_SUMMARY, genres: ['sci-fi', 'action'], status: 'Completed', rating: 4.5, latestChapter: 10, updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), moderationStatus: 'pending' },
  { id: 'the-last-dragon', slug: 'the-last-dragon', title: 'The Last Dragon', author: 'MythWeaver', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/718096/e2e8f0?text=The%20Last%0ADragon', summary: LOREM_IPSUM_SUMMARY, genres: ['fantasy', 'action'], status: 'Completed', rating: 4.7, latestChapter: 12, updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), moderationStatus: 'approved' },
  { id: 'love-in-bloom', slug: 'love-in-bloom', title: 'Love in Bloom', author: 'SweetHeart', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/90cdf4/1a202c?text=Love%20in%0ABloom', summary: LOREM_IPSUM_SUMMARY, genres: ['romance'], status: 'Ongoing', rating: 4.6, latestChapter: 18, updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(), moderationStatus: 'approved' },
  { id: 'blade-of-destiny', slug: 'blade-of-destiny', title: 'Blade of Destiny', author: 'IronWill', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/f56565/1a202c?text=Blade%20of%0ADestiny', summary: LOREM_IPSUM_SUMMARY, genres: ['xianxia', 'action'], status: 'Ongoing', rating: 4.8, latestChapter: 25, updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), moderationStatus: 'approved' },
  { id: 'starfall-chronicles', slug: 'starfall-chronicles', title: 'Starfall Chronicles', author: 'CosmicScribe', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/48bb78/1a202c?text=Starfall%0AChronicles', summary: LOREM_IPSUM_SUMMARY, genres: ['sci-fi', 'fantasy'], status: 'Completed', rating: 4.9, latestChapter: 30, updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(), moderationStatus: 'approved' },
  { id: 'the-cursed-prince', slug: 'the-cursed-prince', title: 'The Cursed Prince', author: 'GrimTale', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/a0aec0/1a202c?text=The%20Cursed%0APrince', summary: LOREM_IPSUM_SUMMARY, genres: ['fantasy'], status: 'Ongoing', rating: 4.4, latestChapter: 10, updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(), moderationStatus: 'approved' },
  { id: 'cybernetic-revolt', slug: 'cybernetic-revolt', title: 'Cybernetic Revolt', author: 'ByteMaster', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/ed8936/1a202c?text=Cybernetic%0ARevolt', summary: LOREM_IPSUM_SUMMARY, genres: ['sci-fi', 'action'], status: 'Completed', rating: 4.6, latestChapter: 22, updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(), moderationStatus: 'approved' },
  { id: 'whispers-of-the-heart', slug: 'whispers-of-the-heart', title: 'Whispers of the Heart', author: 'LoveLorn', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/f6e05e/1a202c?text=Whispers%0Aof%20Heart', summary: LOREM_IPSUM_SUMMARY, genres: ['romance'], status: 'Ongoing', rating: 4.7, latestChapter: 14, updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(), moderationStatus: 'approved' },
  { id: 'heavenly-dao', slug: 'heavenly-dao', title: 'Heavenly Dao', author: 'Sage', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/b794f4/1a202c?text=Heavenly%0ADao', summary: LOREM_IPSUM_SUMMARY, genres: ['xianxia'], status: 'Ongoing', rating: 4.9, latestChapter: 50, updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(), moderationStatus: 'approved' },
  { id: 'the-forgotten-kingdom', slug: 'the-forgotten-kingdom', title: 'The Forgotten Kingdom', author: 'LoreKeeper', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/718096/e2e8f0?text=Forgotten%0AKingdom', summary: LOREM_IPSUM_SUMMARY, genres: ['fantasy', 'action'], status: 'Completed', rating: 4.5, latestChapter: 40, updatedAt: new Date(Date.now() - 86400000 * 11).toISOString(), moderationStatus: 'approved' },
  { id: 'a-kiss-under-the-stars', slug: 'a-kiss-under-the-stars', title: 'A Kiss Under the Stars', author: 'Dreamer', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/ed64a6/1a202c?text=A%20Kiss%0AUnder%20Stars', summary: LOREM_IPSUM_SUMMARY, genres: ['romance'], status: 'Completed', rating: 4.8, latestChapter: 25, updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(), moderationStatus: 'approved' },
  { id: 'renegade-immortal', slug: 'renegade-immortal', title: 'Renegade Immortal', author: 'Er Gen', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/4a5568/a0aec0?text=Renegade%0AImmortal', summary: LOREM_IPSUM_SUMMARY, genres: ['xianxia', 'action'], status: 'Completed', rating: 5.0, latestChapter: 100, updatedAt: new Date(Date.now() - 86400000 * 13).toISOString(), moderationStatus: 'approved' },
  { id: 'void-walker', slug: 'void-walker', title: 'Void Walker', author: 'AbyssDreamer', authorId: 'user-1', coverImageUrl: 'https://placehold.co/300x400/2d3748/e2e8f0?text=Void%0AWalker', summary: LOREM_IPSUM_SUMMARY, genres: ['fantasy', 'sci-fi'], status: 'Ongoing', rating: 4.7, latestChapter: 33, updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(), moderationStatus: 'approved' },
];
export const MOCK_NOVELS: Novel[] = baseNovels.map(novel => ({
  ...novel,
  likeCount: MOCK_LIKES.filter(like => like.novelSlug === novel.slug).length,
  viewCount: MOCK_VIEWS.filter(view => view.novelSlug === novel.slug).length + Math.floor(Math.random() * 500), // Add random views for variety
}));
export const MOCK_CHAPTERS: Chapter[] = MOCK_NOVELS.flatMap(novel => {
  const chapterCount = novel.latestChapter || 20;
  return Array.from({ length: chapterCount }, (_, i) => {
    const chapterNumber = i + 1;
    return {
      id: `${novel.slug}-chapter-${chapterNumber}`,
      novelId: novel.slug,
      chapterNumber: chapterNumber,
      title: `Chapter ${chapterNumber}: The Beginning`,
      content: `This is the content for chapter ${chapterNumber} of ${novel.title}.\n\n${LOREM_IPSUM_CONTENT}`,
      publishedAt: new Date(Date.now() - (chapterCount - i) * 86400000).toISOString(),
    };
  });
});
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    username: 'AuthorOne',
    email: 'author1@example.com',
    // password: "password"
    passwordHash: 'mock_hash_password',
    role: 'author',
    status: 'active',
  },
  {
    id: 'user-2',
    username: 'AdminUser',
    email: 'admin@example.com',
    // password: "admin"
    passwordHash: 'mock_hash_admin',
    role: 'admin',
    status: 'active',
  },
];
export const MOCK_BOOKMARKS: Bookmark[] = [
  {
    id: 'user-1-the-last-dragon',
    userId: 'user-1',
    novelSlug: 'the-last-dragon',
    chapterNumber: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-1-love-in-bloom',
    userId: 'user-1',
    novelSlug: 'love-in-bloom',
    chapterNumber: 10,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];