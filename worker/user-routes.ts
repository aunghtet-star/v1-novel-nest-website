import { Hono, type Context, type Next } from "hono";
import type { Env } from './core-utils';
import { NovelEntity, GenreEntity, ChapterEntity, UserEntity, BookmarkEntity, LikeEntity, ViewEntity, OTPEntity } from "./entities";
import { ok, notFound, bad } from './core-utils';
import type { Novel, Chapter, ChapterListItem, User, AuthResponse, Bookmark, BookmarkedNovel, Genre, Like, OTP } from "@shared/types";
import { HTTPException } from "hono/http-exception";
const paginate = <T>(items: T[], page: number, limit: number): { items: T[], totalPages: number, totalItems: number } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    totalPages,
    totalItems,
  };
};
const sortNovels = (novels: Novel[], sortBy: string | null) => {
  const sorted = [...novels];
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'latest':
    default:
      return sorted.sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }
};
// A WeakMap to hold a singleton promise for seeding, preventing race conditions on cold starts.
const seedPromise = new WeakMap<Env, Promise<void>>();
const seedDataMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  if (!seedPromise.has(c.env)) {
    const promise = Promise.all([
      NovelEntity.ensureSeed(c.env),
      GenreEntity.ensureSeed(c.env),
      ChapterEntity.ensureSeed(c.env),
      UserEntity.ensureSeed(c.env),
      BookmarkEntity.ensureSeed(c.env),
      LikeEntity.ensureSeed(c.env),
      ViewEntity.ensureSeed(c.env),
      OTPEntity.ensureSeed(c.env),
    ]).then(() => { /* void */ });
    seedPromise.set(c.env, promise);
  }
  await seedPromise.get(c.env);
  await next();
};
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Seed data on first request, preventing race conditions
  app.use('/api/*', seedDataMiddleware);
  // --- AUTH ROUTES ---
  app.post('/api/auth/register', async (c) => {
    const { username, email, password } = await c.req.json();
    if (!username || !email || !password) return bad(c, 'Missing required fields');
    const existingUser = await UserEntity.findByEmail(c.env, email);
    if (existingUser) return bad(c, 'User with this email already exists');
    try {
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        email,
        passwordHash: `mock_hash_${password}`,
        role: 'author',
        status: 'unverified',
      };
      await UserEntity.create(c.env, newUser);
      const otpCode = generateOtp();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      const otp: OTP = { id: newUser.id, userId: newUser.id, code: otpCode, expiresAt };
      await OTPEntity.create(c.env, otp);
      console.log(`[OTP for ${email}]: ${otpCode}`); // Simulate sending email
      return ok(c, { message: 'Registration successful. Please check your email for an OTP.' });
    } catch (err) {
      console.error('Registration error:', err);
      return c.json({ success: false, error: (err as Error).message }, 500);
    }
  });
  app.post('/api/auth/verify-otp', async (c) => {
    const { email, otp } = await c.req.json<{ email: string; otp: string }>();
    if (!email || !otp) return bad(c, 'Email and OTP are required');
    const user = await UserEntity.findByEmail(c.env, email);
    if (!user || user.status !== 'unverified') return bad(c, 'Invalid user or user already verified.');
    const otpEntity = new OTPEntity(c.env, user.id);
    if (!await otpEntity.exists()) return bad(c, 'Invalid or expired OTP.');
    const otpData = await otpEntity.getState();
    if (otpData.code !== otp || otpData.expiresAt < Date.now()) {
      return bad(c, 'Invalid or expired OTP.');
    }
    const userEntity = new UserEntity(c.env, user.id);
    await userEntity.mutate(u => ({ ...u, status: 'active' }));
    await otpEntity.delete();
    const { passwordHash, ...userResponse } = user;
    const response: AuthResponse = {
      user: { ...userResponse, status: 'active' },
      token: `mock_token_${user.id}`,
    };
    return ok(c, response);
  });
  app.post('/api/auth/resend-otp', async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!email) return bad(c, 'Email is required');
    const user = await UserEntity.findByEmail(c.env, email);
    if (!user || user.status !== 'unverified') return bad(c, 'Cannot resend OTP for this account.');
    const otpCode = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const otp: OTP = { id: user.id, userId: user.id, code: otpCode, expiresAt };
    const otpEntity = new OTPEntity(c.env, user.id);
    await otpEntity.save(otp);
    console.log(`[Resent OTP for ${email}]: ${otpCode}`);
    return ok(c, { message: 'A new OTP has been sent to your email.' });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) return bad(c, 'Missing email or password');
    const user = await UserEntity.findByEmail(c.env, email);
    if (!user || user.passwordHash !== `mock_hash_${password}`) return bad(c, 'Invalid credentials');
    if (user.status === 'unverified') return bad(c, 'Account not verified. Please check your email for an OTP.');
    if (user.status === 'blocked') return bad(c, 'Your account has been blocked.');
    const { passwordHash, ...userResponse } = user;
    const response: AuthResponse = {
      user: userResponse,
      token: `mock_token_${user.id}`,
    };
    return ok(c, response);
  });
  app.get('/api/auth/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return bad(c, 'Unauthorized');
    const token = authHeader.split(' ')[1];
    const userId = token.replace('mock_token_', '');
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    const { passwordHash, ...userResponse } = user;
    return ok(c, userResponse);
  });
  // --- AUTHOR ROUTES (PROTECTED) ---
  const authorRoutes = new Hono<{ Bindings: Env, Variables: { user: User } }>();
  authorRoutes.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ success: false, error: err.message }, err.status);
    }
    console.error('Author route error:', err.stack || err);
    const errorMessage = err instanceof Error ? err.message : 'An internal server error occurred';
    return c.json({ success: false, error: errorMessage }, 500);
  });
  authorRoutes.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new HTTPException(401, { message: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const userId = token.replace('mock_token_', '');
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) throw new HTTPException(401, { message: 'Invalid token' });
    const user = await userEntity.getState();
    if (user.status === 'blocked') throw new HTTPException(403, { message: 'Your account is blocked.' });
    if (user.status === 'unverified') throw new HTTPException(403, { message: 'Your account is not verified.' });
    c.set('user', user);
    await next();
  });
  // Profile Management
  authorRoutes.put('/profile/username', async (c) => {
    const user = c.get('user');
    const { username } = await c.req.json<{ username: string }>();
    if (!username || username.length < 3) return bad(c, 'Username must be at least 3 characters.');
    const userEntity = new UserEntity(c.env, user.id);
    const updatedUser = await userEntity.mutate(current => ({ ...current, username }));
    const { passwordHash, ...userResponse } = updatedUser;
    return ok(c, userResponse);
  });
  authorRoutes.put('/profile/email', async (c) => {
    const user = c.get('user');
    const { email } = await c.req.json<{ email: string }>();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return bad(c, 'Please provide a valid email.');
    const existingUser = await UserEntity.findByEmail(c.env, email);
    if (existingUser && existingUser.id !== user.id) return bad(c, 'This email is already in use.');
    const userEntity = new UserEntity(c.env, user.id);
    const updatedUser = await userEntity.mutate(current => ({ ...current, email }));
    const { passwordHash, ...userResponse } = updatedUser;
    return ok(c, userResponse);
  });
  authorRoutes.put('/profile/password', async (c) => {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json<{ currentPassword: string, newPassword: string }>();
    if (!currentPassword || !newPassword) return bad(c, 'All password fields are required.');
    if (newPassword.length < 6) return bad(c, 'New password must be at least 6 characters.');
    if (user.passwordHash !== `mock_hash_${currentPassword}`) return bad(c, 'Incorrect current password.');
    const userEntity = new UserEntity(c.env, user.id);
    await userEntity.mutate(current => ({ ...current, passwordHash: `mock_hash_${newPassword}` }));
    return ok(c, { message: 'Password updated successfully.' });
  });
  // Novel Management
  authorRoutes.get('/novels', async (c) => {
    const user = c.get('user');
    const allNovels = await NovelEntity.list(c.env);
    const authorNovels = allNovels.items.filter(n => n.authorId === user.id);
    return ok(c, authorNovels);
  });
  authorRoutes.post('/novels', async (c) => {
    const user = c.get('user');
    const body = await c.req.json<Omit<Novel, 'id' | 'slug' | 'authorId' | 'author' | 'moderationStatus' | 'likeCount' | 'viewCount'>>();
    const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const existingNovel = new NovelEntity(c.env, slug);
    if (await existingNovel.exists()) return bad(c, 'A novel with this title already exists, creating a conflicting slug.');
    const newNovel: Novel = {
      ...body,
      id: slug,
      slug,
      author: user.username,
      authorId: user.id,
      rating: 0,
      updatedAt: new Date().toISOString(),
      moderationStatus: 'pending',
      likeCount: 0,
      viewCount: 0,
    };
    await NovelEntity.create(c.env, newNovel);
    return ok(c, newNovel);
  });
  authorRoutes.put('/novels/:slug', async (c) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const body = await c.req.json<Partial<Novel>>();
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
    const novel = await novelEntity.getState();
    if (novel.authorId !== user.id) throw new HTTPException(403, { message: 'You do not have permission to edit this novel.' });
    const updatedNovel = { ...novel, ...body, updatedAt: new Date().toISOString(), moderationStatus: 'pending' as const };
    await novelEntity.save(updatedNovel);
    return ok(c, updatedNovel);
  });
  authorRoutes.delete('/novels/:slug', async (c) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
    const novel = await novelEntity.getState();
    if (novel.authorId !== user.id) throw new HTTPException(403, { message: 'You do not have permission to delete this novel.' });
    await NovelEntity.delete(c.env, slug);
    return ok(c, { message: 'Novel deleted successfully' });
  });
  // View Management
  authorRoutes.post('/novels/:slug/view', async (c) => {
    try {
      const user = c.get('user');
      const slug = c.req.param('slug');
      if (!slug) return bad(c, 'Novel slug is required');
      const novelEntity = new NovelEntity(c.env, slug);
      if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
      const viewId = `${user.id}-${slug}`;
      const viewEntity = new ViewEntity(c.env, viewId);
      if (!await viewEntity.exists()) {
        await viewEntity.save({ id: viewId, userId: user.id, novelSlug: slug });
        await novelEntity.mutate(novel => ({ ...novel, viewCount: (novel.viewCount || 0) + 1 }));
      }
      return ok(c, { viewed: true });
    } catch (err) {
      console.error("View tracking error:", err);
      return c.json({ success: false, error: (err as Error).message }, 500);
    }
  });
  // Like Management
  authorRoutes.get('/likes', async (c) => {
    const user = c.get('user');
    const allLikes = await LikeEntity.list(c.env);
    const userLikes = allLikes.items.filter(like => like.userId === user.id);
    return ok(c, userLikes);
  });
  authorRoutes.post('/novels/:slug/like', async (c) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
    const likeId = `${user.id}-${slug}`;
    const likeEntity = new LikeEntity(c.env, likeId);
    const novel = await novelEntity.getState();
    if (await likeEntity.exists()) {
      await likeEntity.delete();
      novel.likeCount = Math.max(0, (novel.likeCount || 0) - 1);
      await novelEntity.save(novel);
      return ok(c, { liked: false, likeCount: novel.likeCount });
    } else {
      const newLike: Like = { id: likeId, userId: user.id, novelSlug: slug };
      await LikeEntity.create(c.env, newLike);
      novel.likeCount = (novel.likeCount || 0) + 1;
      await novelEntity.save(novel);
      return ok(c, { liked: true, likeCount: novel.likeCount });
    }
  });
  // Chapter Management
  const chapterRoutes = new Hono<{ Bindings: Env, Variables: { user: User } }>();
  chapterRoutes.use('*', async (c, next) => {
    const user = c.get('user');
    const slug = c.req.param('slug');
    if (!slug) throw new HTTPException(400, { message: 'Novel slug is required' });
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) throw new HTTPException(404, { message: 'Novel not found' });
    const novel = await novelEntity.getState();
    if (novel.authorId !== user.id) throw new HTTPException(403, { message: 'You do not have permission to manage chapters for this novel.' });
    await next();
  });
  chapterRoutes.get('/', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapters = await ChapterEntity.listByNovel(c.env, slug);
    return ok(c, chapters);
  });
  chapterRoutes.get('/:chapterNumber', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapterNumber = parseInt(c.req.param('chapterNumber'), 10);
    const chapterId = `${slug}-chapter-${chapterNumber}`;
    const chapter = await ChapterEntity.getById(c.env, chapterId);
    if (!chapter) return notFound(c, 'Chapter not found');
    return ok(c, chapter);
  });
  chapterRoutes.post('/', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const body = await c.req.json<Omit<Chapter, 'id' | 'novelId' | 'publishedAt'>>();
    const chapterId = `${slug}-chapter-${body.chapterNumber}`;
    const existingChapter = await ChapterEntity.getById(c.env, chapterId);
    if (existingChapter) return bad(c, `Chapter number ${body.chapterNumber} already exists for this novel.`);
    const newChapter: Chapter = {
      ...body,
      id: chapterId,
      novelId: slug,
      publishedAt: new Date().toISOString(),
    };
    await ChapterEntity.create(c.env, newChapter);
    return ok(c, newChapter);
  });
  chapterRoutes.put('/:chapterNumber', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapterNumber = parseInt(c.req.param('chapterNumber'), 10);
    const body = await c.req.json<Partial<Chapter>>();
    const chapterId = `${slug}-chapter-${chapterNumber}`;
    const chapterEntity = new ChapterEntity(c.env, chapterId);
    if (!await chapterEntity.exists()) return notFound(c, 'Chapter not found');
    const chapter = await chapterEntity.getState();
    const updatedChapter = { ...chapter, ...body, publishedAt: new Date().toISOString() };
    await chapterEntity.save(updatedChapter);
    return ok(c, updatedChapter);
  });
  chapterRoutes.delete('/:chapterNumber', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapterNumber = parseInt(c.req.param('chapterNumber'), 10);
    const chapterId = `${slug}-chapter-${chapterNumber}`;
    const existed = await ChapterEntity.delete(c.env, chapterId);
    if (!existed) return notFound(c, 'Chapter not found');
    return ok(c, { message: 'Chapter deleted successfully' });
  });
  authorRoutes.route('/novels/:slug/chapters', chapterRoutes);
  // Bookmark Management
  const bookmarkRoutes = new Hono<{ Bindings: Env, Variables: { user: User } }>();
  bookmarkRoutes.get('/', async (c) => {
    const user = c.get('user');
    const allBookmarks = await BookmarkEntity.list(c.env);
    const userBookmarks = allBookmarks.items.filter(b => b.userId === user.id);
    const bookmarkedNovels: BookmarkedNovel[] = [];
    for (const bookmark of userBookmarks) {
      const novelEntity = new NovelEntity(c.env, bookmark.novelSlug);
      if (await novelEntity.exists()) {
        const novel = await novelEntity.getState();
        if (novel.moderationStatus === 'approved') {
          bookmarkedNovels.push({ ...bookmark, novel });
        }
      }
    }
    return ok(c, bookmarkedNovels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
  bookmarkRoutes.post('/', async (c) => {
    const user = c.get('user');
    const { novelSlug, chapterNumber } = await c.req.json<{ novelSlug: string; chapterNumber?: number }>();
    if (!novelSlug) return bad(c, 'novelSlug is required');
    const id = `${user.id}-${novelSlug}`;
    const bookmarkEntity = new BookmarkEntity(c.env, id);
    const newBookmark: Bookmark = {
      id,
      userId: user.id,
      novelSlug,
      chapterNumber,
      createdAt: new Date().toISOString(),
    };
    if (await bookmarkEntity.exists()) {
      await bookmarkEntity.save(newBookmark);
    } else {
      await BookmarkEntity.create(c.env, newBookmark);
    }
    return ok(c, newBookmark);
  });
  bookmarkRoutes.delete('/:novelSlug', async (c) => {
    const user = c.get('user');
    const novelSlug = c.req.param('novelSlug');
    if (!novelSlug) return bad(c, 'novelSlug is required');
    const id = `${user.id}-${novelSlug}`;
    const existed = await BookmarkEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'Bookmark not found');
    return ok(c, { message: 'Bookmark removed' });
  });
  authorRoutes.route('/bookmarks', bookmarkRoutes);
  app.route('/api/author', authorRoutes);
  // --- ADMIN ROUTES (PROTECTED) ---
  const adminRoutes = new Hono<{ Bindings: Env, Variables: { user: User } }>();
  adminRoutes.use('*', async (c, next) => {
    const user = c.get('user');
    if (user.role !== 'admin') throw new HTTPException(403, { message: 'Forbidden: Admins only' });
    await next();
  });
  adminRoutes.get('/users', async (c) => {
    const users = await UserEntity.list(c.env);
    const usersWithoutPasswords = users.items.map(({ passwordHash, ...rest }) => rest);
    return ok(c, usersWithoutPasswords);
  });
  adminRoutes.put('/users/:id', async (c) => {
    const userId = c.req.param('id');
    const { role, status } = await c.req.json<{ role?: User['role'], status?: User['status'] }>();
    if (!userId) return bad(c, 'User ID is required');
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    if (role) user.role = role;
    if (status) user.status = status;
    await userEntity.save(user);
    const { passwordHash, ...userResponse } = user;
    return ok(c, userResponse);
  });
  adminRoutes.get('/novels/pending', async (c) => {
    const allNovels = await NovelEntity.list(c.env);
    const pendingNovels = allNovels.items.filter(n => n.moderationStatus === 'pending');
    return ok(c, pendingNovels);
  });
  adminRoutes.put('/novels/:slug/status', async (c) => {
    const slug = c.req.param('slug');
    const { status } = await c.req.json<{ status: Novel['moderationStatus'] }>();
    if (!slug) return bad(c, 'Novel slug is required');
    if (!['approved', 'rejected'].includes(status)) return bad(c, 'Invalid status');
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
    const novel = await novelEntity.getState();
    novel.moderationStatus = status;
    await novelEntity.save(novel);
    return ok(c, novel);
  });
  adminRoutes.post('/genres', async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    if (!name) return bad(c, 'Genre name is required');
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const id = slug;
    const existingGenre = new GenreEntity(c.env, slug);
    if (await existingGenre.exists()) return bad(c, 'A genre with this name already exists.');
    const newGenre: Genre = { id, name, slug };
    await GenreEntity.create(c.env, newGenre);
    return ok(c, newGenre);
  });
  adminRoutes.put('/genres/:slug', async (c) => {
    const slug = c.req.param('slug');
    const { name } = await c.req.json<{ name: string }>();
    if (!slug) return bad(c, 'Genre slug is required');
    if (!name) return bad(c, 'Genre name is required');
    const genreEntity = new GenreEntity(c.env, slug);
    if (!await genreEntity.exists()) return notFound(c, 'Genre not found');
    const genre = await genreEntity.getState();
    genre.name = name;
    await genreEntity.save(genre);
    return ok(c, genre);
  });
  adminRoutes.delete('/genres/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Genre slug is required');
    const existed = await GenreEntity.delete(c.env, slug);
    if (!existed) return notFound(c, 'Genre not found');
    return ok(c, { message: 'Genre deleted successfully' });
  });
  app.route('/api/admin', authorRoutes.use('*', async (c, next) => next()).route('/', adminRoutes));
  // --- PUBLIC NOVEL & CONTENT ROUTES ---
  app.use('/api/novels/:slug/*', async (c, next) => {
    const slug = c.req.param('slug');
    const staticSlugs = ['latest', 'popular', 'completed', 'search'];
    if (staticSlugs.includes(slug)) return await next();
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const userId = token.replace('mock_token_', '');
      if (userId) {
        const userEntity = new UserEntity(c.env, userId);
        if (await userEntity.exists()) {
          const user = await userEntity.getState();
          if (user.role === 'admin') return await next();
        }
      }
    }
    const novelEntity = new NovelEntity(c.env, slug);
    if (await novelEntity.exists()) {
      const novel = await novelEntity.getState();
      if (novel.moderationStatus !== 'approved') return notFound(c, 'Novel not found');
    } else {
      return notFound(c, 'Novel not found');
    }
    await next();
  });
  app.get('/api/novels/search', async (c) => {
    const query = c.req.query('q')?.toLowerCase();
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '12', 10);
    const sortBy = c.req.query('sort');
    if (!query) return ok(c, { items: [], totalPages: 0, currentPage: 1, totalItems: 0 });
    const allNovels = await NovelEntity.list(c.env);
    const matchingNovels = allNovels.items.filter(novel =>
      novel.moderationStatus === 'approved' &&
      (novel.title.toLowerCase().includes(query) || novel.author.toLowerCase().includes(query))
    );
    const sortedNovels = sortNovels(matchingNovels, sortBy ?? null);
    const paginated = paginate(sortedNovels, page, limit);
    return ok(c, { ...paginated, currentPage: page });
  });
  app.get('/api/novels/latest', async (c) => {
    const allNovelsResult = await NovelEntity.list(c.env);
    const approvedNovels = allNovelsResult.items.filter(n => n.moderationStatus === 'approved');
    const sortedNovels = [...approvedNovels].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
    return ok(c, sortedNovels.slice(0, 10));
  });
  app.get('/api/novels/popular', async (c) => {
    const allNovelsResult = await NovelEntity.list(c.env);
    const approvedNovels = allNovelsResult.items.filter(n => n.moderationStatus === 'approved');
    const sortedNovels = [...approvedNovels].sort((a, b) => b.rating - a.rating);
    return ok(c, sortedNovels.slice(0, 10));
  });
  app.get('/api/novels/completed', async (c) => {
    const allNovelsResult = await NovelEntity.list(c.env);
    const completedNovels = allNovelsResult.items.filter(n => n.status === 'Completed' && n.moderationStatus === 'approved');
    return ok(c, completedNovels);
  });
  app.get('/api/genres', async (c) => {
    const page = await GenreEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/genres/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Genre slug is required');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '12', 10);
    const sortBy = c.req.query('sort');
    const genreEntity = new GenreEntity(c.env, slug);
    if (!await genreEntity.exists()) return notFound(c, 'Genre not found');
    const genre = await genreEntity.getState();
    const allNovels = await NovelEntity.list(c.env);
    const novelsInGenre = allNovels.items.filter(novel => novel.genres.includes(slug) && novel.moderationStatus === 'approved');
    const sortedNovels = sortNovels(novelsInGenre, sortBy ?? null);
    const paginated = paginate(sortedNovels, page, limit);
    return ok(c, { genre, novels: { ...paginated, currentPage: page } });
  });
  app.get('/api/novels/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const novelEntity = new NovelEntity(c.env, slug);
    if (!await novelEntity.exists()) return notFound(c, 'Novel not found');
    const novel = await novelEntity.getState();
    const completeNovel = {
      ...novel,
      likeCount: novel.likeCount ?? 0,
      viewCount: novel.viewCount ?? 0,
    };
    return ok(c, completeNovel);
  });
  app.get('/api/novels/:slug/chapters', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const chapters = await ChapterEntity.listByNovel(c.env, slug);
    const paginated = paginate(chapters, page, limit);
    return ok(c, { ...paginated, currentPage: page });
  });
  app.get('/api/novels/:slug/chapter-list', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapters = await ChapterEntity.listByNovel(c.env, slug);
    const chapterList: ChapterListItem[] = chapters.map(({ content, ...rest }) => rest);
    return ok(c, chapterList);
  });
  app.get('/api/novels/:slug/chapters/:chapterNumber', async (c) => {
    const slug = c.req.param('slug');
    if (!slug) return bad(c, 'Novel slug is required');
    const chapterNumber = parseInt(c.req.param('chapterNumber'), 10);
    const chapterId = `${slug}-chapter-${chapterNumber}`;
    const chapter = await ChapterEntity.getById(c.env, chapterId);
    if (!chapter) return notFound(c, 'Chapter not found');
    return ok(c, chapter);
  });
}