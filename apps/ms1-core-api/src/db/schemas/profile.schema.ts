import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./user.schema";


export const profiles = pgTable("profiles", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  userId: uuid("user_id")
    .references(
      () => users.id,
      {
        onDelete: "cascade",
      }
    )
    .unique()
    .notNull(),

  currentStage: text("current_stage")
    .notNull(),

  assessmentStatus: text("assessment_status")
    .default("not_started")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

});