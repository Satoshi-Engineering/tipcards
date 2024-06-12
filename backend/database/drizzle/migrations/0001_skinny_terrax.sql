-- Custom SQL migration file, put you code below! --
INSERT INTO "Image" ("id", "type", "name", "data")
VALUES
  ('bitcoin', 'svg', 'Bitcoin Logo', 'data'),
  ('lightning', 'svg', 'Lightning Logo', 'data');

INSERT INTO "LandingPage" ("id", "type", "name", "url")
VALUES
  ('default', 'core', 'Default', null);
