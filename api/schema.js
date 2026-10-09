
import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const devices = pgTable('devices', {
  device_id: serial('id').primaryKey(),
  name: varchar('name', {length: 100}).notNull(),
  key: varchar('key', {length: 100}).notNull(),
  createdAt: timestamp('createdAt').defaultNow()

});

export const users = pgTable('users', {
  user_id: serial('id').primaryKey(),
  name: varchar('name', {length: 100}).notNull(),
  key: varchar('key', {length: 100}).notNull(),
  createdAt: timestamp('createdAt').defaultNow()
});