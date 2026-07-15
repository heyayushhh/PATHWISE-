import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";



/*
|--------------------------------------------------------------------------
| Assessment Sessions
|--------------------------------------------------------------------------
|
| Represents one attempt by a user.
|
| Example:
|
| User starts Career Assessment
|
| Session:
| abc123
|
| Status:
| IN_PROGRESS
|
|--------------------------------------------------------------------------
*/


export const assessmentSessions = pgTable(
  "assessment_sessions",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),


    userId: uuid("user_id")
      .notNull(),


    assessmentType: varchar(
      "assessment_type",
      {
        length:100
      }
    )
    .notNull(),


    status: varchar(
      "status",
      {
        length:50
      }
    )
    .notNull()
    .default("IN_PROGRESS"),


    startedAt: timestamp(
      "started_at"
    )
    .defaultNow(),


    completedAt: timestamp(
      "completed_at"
    ),


    createdAt: timestamp(
      "created_at"
    )
    .defaultNow()

  }
);





/*
|--------------------------------------------------------------------------
| Question Pools
|--------------------------------------------------------------------------
|
| Collection of questions.
|
| Example:
|
| Career Interest Assessment
| Personality Assessment
|
|--------------------------------------------------------------------------
*/


export const questionPools = pgTable(
  "question_pools",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),


    name: varchar(
      "name",
      {
        length:100
      }
    )
    .notNull(),


    description:text(
      "description"
    ),


    version:integer(
      "version"
    )
    .notNull()
    .default(1),


    createdAt:timestamp(
      "created_at"
    )
    .defaultNow()

  }
);





/*
|--------------------------------------------------------------------------
| Questions
|--------------------------------------------------------------------------
|
| Stores actual assessment questions.
|
|--------------------------------------------------------------------------
*/


export const questions = pgTable(
  "questions",
  {

    id:uuid("id")
      .defaultRandom()
      .primaryKey(),


    questionText:text(
      "question_text"
    )
    .notNull(),


    questionType:varchar(
      "question_type",
      {
        length:50
      }
    )
    .notNull()
    .default("MCQ"),


    orderNo:integer(
      "order_no"
    )
    .notNull(),


    createdAt:timestamp(
      "created_at"
    )
    .defaultNow()

  }
);






/*
|--------------------------------------------------------------------------
| Question Options
|--------------------------------------------------------------------------
|
| Options for MCQ questions.
|
| Example:
|
| Strongly Agree
| Agree
| Neutral
|
|--------------------------------------------------------------------------
*/


export const questionOptions = pgTable(
  "question_options",
  {

    id:uuid("id")
      .defaultRandom()
      .primaryKey(),


    questionId:uuid(
      "question_id"
    )
    .notNull(),


    optionText:text(
      "option_text"
    )
    .notNull(),


    optionValue:integer(
      "option_value"
    )
    .notNull(),


    orderNo:integer(
      "order_no"
    )
    .notNull()

  }
);






/*
|--------------------------------------------------------------------------
| Question Pool Mapping
|--------------------------------------------------------------------------
|
| Many-to-many relation:
|
| One question
|     |
|     |
| Multiple assessments
|
|--------------------------------------------------------------------------
*/


export const questionPoolMapping = pgTable(
  "question_pool_mapping",
  {

    id:uuid("id")
      .defaultRandom()
      .primaryKey(),


    poolId:uuid(
      "pool_id"
    )
    .notNull(),


    questionId:uuid(
      "question_id"
    )
    .notNull()

  }
);






/*
|--------------------------------------------------------------------------
| Assessment Responses
|--------------------------------------------------------------------------
|
| Stores user answers.
|
|--------------------------------------------------------------------------
*/


export const assessmentResponses = pgTable(
  "assessment_responses",
  {

    id:uuid("id")
      .defaultRandom()
      .primaryKey(),


    sessionId:uuid(
      "session_id"
    )
    .notNull(),


    questionId:uuid(
      "question_id"
    )
    .notNull(),


    selectedOptionId:uuid(
      "selected_option_id"
    )
    .notNull(),


    createdAt:timestamp(
      "created_at"
    )
    .defaultNow()

  }
);