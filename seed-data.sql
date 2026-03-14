-- Seed sample topics
INSERT INTO topics (name, description) VALUES
('Science', 'Explore the wonders of science through interactive stories')
ON CONFLICT DO NOTHING;

INSERT INTO topics (name, description) VALUES
('History', 'Learn about historical events and figures')
ON CONFLICT DO NOTHING;

INSERT INTO topics (name, description) VALUES
('Nature', 'Discover the beauty of nature and wildlife')
ON CONFLICT DO NOTHING;

-- Seed sample stories
INSERT INTO stories (title, description, content, topic_id, user_id) 
SELECT 
  'The Solar System Explorer',
  'Join Max on an incredible journey through our solar system',
  'Scene 1: Welcome to the Solar System
The sun glows brightly at the center of our solar system. Max, a curious astronomer, looks through his telescope and discovers something amazing.

Scene 2: Mercury and Venus
The closest planets to the sun are Mercury and Venus. Mercury is small and rocky, while Venus is covered in thick clouds.

Scene 3: Earth
Our home planet Earth is the only planet known to have life. It has water, oxygen, and a protective atmosphere.

Scene 4: Mars
Mars, the red planet, is named after the Roman god of war. Scientists are exploring if life ever existed there.

Scene 5: The Asteroid Belt
Between Mars and Jupiter lies the asteroid belt, filled with rocky remnants from the early solar system.',
  id,
  NULL
FROM topics WHERE name = 'Science' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stories (title, description, content, topic_id, user_id) 
SELECT 
  'The Rainforest Adventure',
  'Discover the hidden secrets of the Amazon rainforest',
  'Scene 1: Entering the Rainforest
The rainforest is the largest and most biodiverse forest on Earth. Its thick canopy towers above, creating a green cathedral.

Scene 2: The Canopy Layer
High above the ground, the tallest trees catch the most sunlight. Animals like monkeys and parrots live in this sunny layer.

Scene 3: The Understory
Below the canopy, larger animals like jaguars and sloths hunt and feed. This layer is darker and more humid.

Scene 4: The Forest Floor
The ground is covered with leaves, roots, and creatures breaking down organic matter. Fungi play a crucial role here.

Scene 5: The River of Life
The Amazon River runs through the forest, supporting countless species of fish, dolphins, and crocodiles.',
  id,
  NULL
FROM topics WHERE name = 'Nature' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO stories (title, description, content, topic_id, user_id) 
SELECT 
  'Ancient Egypt Unveiled',
  'Travel back in time to discover the wonders of ancient Egypt',
  'Scene 1: The Nile River
The Nile River was the lifeblood of ancient Egypt. Annual floods brought nutrients that allowed civilization to flourish.

Scene 2: The Pyramids
The pyramids were massive tombs built for pharaohs. The largest pyramid, Khufu, took 20 years to build.

Scene 3: Pharaohs and Gods
Egyptian pharaohs were considered divine rulers. They made important decisions with help from priests and advisors.

Scene 4: Hieroglyphics
Ancient Egyptians developed a writing system using hieroglyphics. These symbols represented sounds and objects.

Scene 5: Legacy
The ancient Egyptians made contributions to mathematics, astronomy, and architecture that still influence us today.',
  id,
  NULL
FROM topics WHERE name = 'History' LIMIT 1
ON CONFLICT DO NOTHING;

-- Seed sample quizzes
INSERT INTO quizzes (title, description, topic_id)
SELECT 
  'Solar System Quiz',
  'Test your knowledge about the planets and our solar system',
  id
FROM topics WHERE name = 'Science' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quizzes (title, description, topic_id)
SELECT 
  'Rainforest Facts Quiz',
  'Learn fascinating facts about the world''s rainforests',
  id
FROM topics WHERE name = 'Nature' LIMIT 1
ON CONFLICT DO NOTHING;

-- Add questions for Solar System Quiz
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'How many planets are in our solar system?',
  '["7", "8", "9", "10"]'::JSONB,
  '8'
FROM quizzes WHERE title = 'Solar System Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'Which planet is closest to the sun?',
  '["Venus", "Mercury", "Earth", "Mars"]'::JSONB,
  'Mercury'
FROM quizzes WHERE title = 'Solar System Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'What is the largest planet in our solar system?',
  '["Saturn", "Jupiter", "Neptune", "Uranus"]'::JSONB,
  'Jupiter'
FROM quizzes WHERE title = 'Solar System Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'Which planet is known as the red planet?',
  '["Mars", "Venus", "Saturn", "Mercury"]'::JSONB,
  'Mars'
FROM quizzes WHERE title = 'Solar System Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

-- Add questions for Rainforest Quiz
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'Which river runs through the Amazon rainforest?',
  '["Congo River", "Yangtze River", "Amazon River", "Nile River"]'::JSONB,
  'Amazon River'
FROM quizzes WHERE title = 'Rainforest Facts Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'What percentage of Earth''s oxygen is produced by the rainforest?',
  '["10%", "20%", "30%", "50%"]'::JSONB,
  '20%'
FROM quizzes WHERE title = 'Rainforest Facts Quiz' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
SELECT 
  id,
  'Which animal is not found in the rainforest?',
  '["Jaguar", "Polar Bear", "Sloth", "Poison Dart Frog"]'::JSONB,
  'Polar Bear'
FROM quizzes WHERE title = 'Rainforest Facts Quiz' LIMIT 1
ON CONFLICT DO NOTHING;
