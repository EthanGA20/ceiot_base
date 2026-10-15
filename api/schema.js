
import { pgTable, serial, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

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

export const measurements = pgTable('measurements', {
  measure_id: serial('measure_id').primaryKey(),
  device_id: integer('device_id').notNull().references(() => devices.device_id),
  temperature: varchar('temperature', { length: 50 }),
  pressure: varchar('pressure', { length: 50 }),
  humidity: varchar('humidity', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow()
});