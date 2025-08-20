import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('User', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(),
  avatar: text('avatar'),
  cover: text('cover'),
  name: text('name'),
  surname: text('surname'),
  description: text('description'),
  city: text('city'),
  role: text('role', { enum: ['patient', 'doctor'] }).default('patient').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
})

export const posts = pgTable('Post', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  desc: text('desc').notNull(),
  img: text('img'),
  video: text('video'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const comments = pgTable('Comment', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  desc: text('desc').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
})

export const likes = pgTable('Like', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('postId').references(() => posts.id, { onDelete: 'cascade' }),
  commentId: integer('commentId').references(() => comments.id, { onDelete: 'cascade' }),
})

export const chats = pgTable('Chat', {
  id: text('id').primaryKey(),
  doctorId: text('doctorId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  patientId: text('patientId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
})

export const messages = pgTable('Message', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  senderId: text('senderId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chatId: text('chatId').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  likes: many(likes),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [likes.commentId],
    references: [comments.id],
  }),
}))