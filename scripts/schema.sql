CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  email           text NOT NULL UNIQUE,
  password_hash   text NOT NULL,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  birth_day       smallint CHECK (birth_day BETWEEN 1 AND 31),
  birth_month     smallint CHECK (birth_month BETWEEN 1 AND 12),
  level           text,
  first_timer     boolean NOT NULL DEFAULT false,
  gender          text,
  campus_address  text,
  phone           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  service_date  date NOT NULL,
  token         text NOT NULL UNIQUE,
  is_open       boolean NOT NULL DEFAULT true,
  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS services_date_idx ON services (service_date DESC);

CREATE TABLE IF NOT EXISTS attendance (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id     uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at  timestamptz NOT NULL DEFAULT now(),
  rating         smallint CHECK (rating BETWEEN 1 AND 5),
  comment        text,
  UNIQUE (service_id, user_id)
);
CREATE INDEX IF NOT EXISTS attendance_user_idx ON attendance (user_id);
