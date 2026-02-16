-- Political CRM Database Schema
-- Language: SQL (PostgreSQL compatible)

-- 1. Table: People (Основно Досие)
CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    membership_card_id VARCHAR(50) UNIQUE NOT NULL, -- Уникален номер на членска карта
    full_name VARCHAR(100) NOT NULL,                -- Три имена
    photo_url TEXT,                                 -- Снимка на човека (URL)
    
    -- Контакти
    phone VARCHAR(20),
    email VARCHAR(100),
    social_fb VARCHAR(255),
    social_instagram VARCHAR(255),
    social_linkedin VARCHAR(255),
    
    -- Локация (География)
    city VARCHAR(50),
    address TEXT,
    region VARCHAR(50),
    voting_section VARCHAR(20),                     -- Избирателна секция (СИК)
    
    -- Демография и Умения
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    profession VARCHAR(100),
    skills TEXT[],                                  -- Масив от умения (напр. {'Шофьор', 'IT'})
    
    -- Политически статус
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Excluded')),
    role VARCHAR(20) CHECK (role IN ('Supporter', 'Member', 'Volunteer', 'Coordinator', 'Advocate')),
    recruited_by_id INT REFERENCES people(id),      -- Кой го е довел?
    join_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Notes (История на бележките)
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    author_id INT, -- В бъдеще ще се върже към Users таблица
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Tags (Динамични Категории)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#000000'
);

-- Mapping table for People <-> Tags (Many-to-Many)
CREATE TABLE person_tags (
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (person_id, tag_id)
);

-- 4. Table: Events & Tasks (Календар и Задачи)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to_id INT REFERENCES people(id),
    due_date TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Speed (Smart Search optimization)
CREATE INDEX idx_people_name ON people(full_name);
CREATE INDEX idx_people_card ON people(membership_card_id);
CREATE INDEX idx_people_phone ON people(phone);
CREATE INDEX idx_people_city ON people(city);
CREATE INDEX idx_people_profession ON people(profession);
