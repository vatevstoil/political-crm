-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_people" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "membership_card_id" TEXT,
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
    "voting_mobile" TEXT,
    "pensioner" BOOLEAN NOT NULL DEFAULT false,
    "disability" TEXT,
    "employer" TEXT,
    "university" TEXT,
    "specialty" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_people" ("address", "birth_date", "city", "created_at", "email", "full_name", "gender", "id", "join_date", "membership_card_id", "phone", "photo_url", "profession", "region", "role", "skills", "social_fb", "social_instagram", "social_linkedin", "status", "updated_at", "voting_section") SELECT "address", "birth_date", "city", "created_at", "email", "full_name", "gender", "id", "join_date", "membership_card_id", "phone", "photo_url", "profession", "region", "role", "skills", "social_fb", "social_instagram", "social_linkedin", "status", "updated_at", "voting_section" FROM "people";
DROP TABLE "people";
ALTER TABLE "new_people" RENAME TO "people";
CREATE UNIQUE INDEX "people_membership_card_id_key" ON "people"("membership_card_id");
CREATE INDEX "people_full_name_idx" ON "people"("full_name");
CREATE INDEX "people_membership_card_id_idx" ON "people"("membership_card_id");
CREATE INDEX "people_phone_idx" ON "people"("phone");
CREATE INDEX "people_city_idx" ON "people"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
