CREATE TABLE IF NOT EXISTS eventos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          VARCHAR(255) NOT NULL,
  tipo            VARCHAR(50),
  fecha           DATE NOT NULL,
  hora            TIME,
  user_id         UUID REFERENCES users(id),
  procedimiento_id UUID REFERENCES procedimientos(id),
  google_event_id VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
