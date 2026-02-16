-- CreateTable
CREATE TABLE "people" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "membership_card_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "social_fb" TEXT,
    "social_instagram" TEXT,
    "social_linkedin" TEXT,
    "city" TEXT,
    "address" TEXT,
    "region" TEXT,
    "voting_section" TEXT,
    "birth_date" DATETIME,
    "gender" TEXT,
    "profession" TEXT,
    "skills" TEXT,
    "status" TEXT,
    "role" TEXT,
    "join_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "person_id" INTEGER NOT NULL,
    "author_id" INTEGER,
    CONSTRAINT "notes_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag_name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000'
);

-- CreateTable
CREATE TABLE "person_tags" (
    "person_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("person_id", "tag_id"),
    CONSTRAINT "person_tags_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "person_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "location" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_to_id" INTEGER,
    "due_date" DATETIME,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "people" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "people_membership_card_id_key" ON "people"("membership_card_id");

-- CreateIndex
CREATE INDEX "people_full_name_idx" ON "people"("full_name");

-- CreateIndex
CREATE INDEX "people_membership_card_id_idx" ON "people"("membership_card_id");

-- CreateIndex
CREATE INDEX "people_phone_idx" ON "people"("phone");

-- CreateIndex
CREATE INDEX "people_city_idx" ON "people"("city");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_name_key" ON "tags"("tag_name");
