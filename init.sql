-- Создаём тип ENUM для ролей пользователей
CREATE TYPE role_enum AS ENUM ('user', 'admin');

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    role role_enum NOT NULL DEFAULT 'user'
);

-- Таблица голосований
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    candidates TEXT[] NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);


-- Таблица предложенных голосований
CREATE TABLE proposed_polls (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    candidates TEXT[] NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE
);


-- Таблица запрос токенов
CREATE TABLE token_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Таблица истории голосований пользователей
CREATE TABLE vote_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем описание к активным голосованиям
ALTER TABLE polls
ADD COLUMN description TEXT DEFAULT '';

-- Добавляем описание к предложенным голосованиям
ALTER TABLE proposed_polls
ADD COLUMN description TEXT DEFAULT '';

ALTER TABLE proposed_polls ADD COLUMN approved_by_admin boolean DEFAULT false;

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR DEFAULT 'member'
);

CREATE TABLE group_join_requests (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted BOOLEAN DEFAULT FALSE
);

-- Если таблица polls уже существует, добавьте это поле:
ALTER TABLE polls ADD COLUMN group_id INTEGER REFERENCES groups(id);

ALTER TABLE proposed_polls ADD COLUMN group_id INTEGER;

ALTER TABLE vote_history DROP COLUMN candidate ;

ALTER TABLE users ADD COLUMN avatar_hash VARCHAR;
ALTER TABLE proposed_polls ADD COLUMN user_id INTEGER REFERENCES users(id);


ALTER TABLE proposed_polls
ADD COLUMN creator_id INTEGER REFERENCES users(id);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);



