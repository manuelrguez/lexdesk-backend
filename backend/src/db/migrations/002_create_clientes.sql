CREATE TABLE IF NOT EXISTS clientes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(200) NOT NULL,
  nif        VARCHAR(20),
  direccion  TEXT,
  telefono   VARCHAR(30),
  email      VARCHAR(255),
  user_id    UUID REFERENCES users(id),
  notas      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
