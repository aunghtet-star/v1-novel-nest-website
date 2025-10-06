import { IndexedEntity } from "./core-utils";
import type { Novel, Genre, Chapter, User, Bookmark, Like, View, OTP } from "@shared/types";
import { MOCK_NOVELS, MOCK_GENRES, MOCK_CHAPTERS, MOCK_USERS, MOCK_BOOKMARKS, MOCK_LIKES, MOCK_VIEWS } from "@shared/mock-data";
import type { Env } from "./core-utils";
export class NovelEntity extends IndexedEntity<Novel> {
  static readonly entityName = "novel";
  static readonly indexName = "novels";
  static readonly initialState: Novel = {
    id: "",
    slug: "",
    title: "",
    author: "",
    authorId: "",
    coverImageUrl: "",
    summary: "",
    genres: [],
    status: 'Ongoing',
    rating: 0,
    moderationStatus: 'pending',
    likeCount: 0,
    viewCount: 0,
  };
  static seedData = MOCK_NOVELS;
  static override keyOf(state: Partial<Novel>): string {
    return state.slug ?? "";
  }
}
export class GenreEntity extends IndexedEntity<Genre> {
  static readonly entityName = "genre";
  static readonly indexName = "genres";
  static readonly initialState: Genre = { id: "", name: "", slug: "" };
  static seedData = MOCK_GENRES;
  static override keyOf(state: Partial<Genre>): string {
    return state.slug ?? "";
  }
}
export class ChapterEntity extends IndexedEntity<Chapter> {
  static readonly entityName = "chapter";
  static readonly indexName = "chapters";
  static readonly initialState: Chapter = {
    id: "",
    novelId: "",
    chapterNumber: 0,
    title: "",
    content: "",
    publishedAt: ""
  };
  static seedData = MOCK_CHAPTERS;
  static override keyOf(state: Partial<Chapter>): string {
    return state.id ?? "";
  }
  static async listByNovel(env: Env, novelSlug: string): Promise<Chapter[]> {
    const allChaptersResult = await this.list(env);
    const chapters = allChaptersResult.items.
    filter((c) => c.novelId === novelSlug).
    sort((a, b) => a.chapterNumber - b.chapterNumber);
    return chapters;
  }
  static async getById(env: Env, chapterId: string): Promise<Chapter | null> {
    const entity = new ChapterEntity(env, chapterId);
    if (await entity.exists()) {
      return entity.getState();
    }
    return null;
  }
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    username: "",
    email: "",
    passwordHash: "",
    role: "author",
    status: 'unverified',
  };
  static seedData = MOCK_USERS;
  static override keyOf(state: Partial<User>): string {
    return state.id ?? "";
  }
  static async findByEmail(env: Env, email: string): Promise<User | null> {
    const allUsers = await this.list(env);
    return allUsers.items.find((u) => u.email === email) || null;
  }
}
export class BookmarkEntity extends IndexedEntity<Bookmark> {
  static readonly entityName = "bookmark";
  static readonly indexName = "bookmarks";
  static readonly initialState: Bookmark = {
    id: "",
    userId: "",
    novelSlug: "",
    createdAt: "",
  };
  static seedData = MOCK_BOOKMARKS;
  static override keyOf(state: Partial<Bookmark>): string {
    return state.id ?? "";
  }
}
export class LikeEntity extends IndexedEntity<Like> {
  static readonly entityName = "like";
  static readonly indexName = "likes";
  static readonly initialState: Like = {
    id: "",
    userId: "",
    novelSlug: "",
  };
  static seedData = MOCK_LIKES;
  static override keyOf(state: Partial<Like>): string {
    return state.id ?? "";
  }
}
export class ViewEntity extends IndexedEntity<View> {
  static readonly entityName = "view";
  static readonly indexName = "views";
  static readonly initialState: View = {
    id: "",
    userId: "",
    novelSlug: "",
  };
  static seedData = MOCK_VIEWS;
  static override keyOf(state: Partial<View>): string {
    return state.id ?? "";
  }
}
export class OTPEntity extends IndexedEntity<OTP> {
  static readonly entityName = "otp";
  static readonly indexName = "otps";
  static readonly initialState: OTP = {
    id: "",
    userId: "",
    code: "",
    expiresAt: 0,
  };
  static seedData = []; // No mock OTPs
  static override keyOf(state: Partial<OTP>): string {
    return state.id ?? "";
  }
}