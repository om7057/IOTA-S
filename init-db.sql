--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_ChatMessages_sender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ChatMessages_sender" AS ENUM (
    'user',
    'bot'
);


--
-- Name: enum_ChatMessages_sentiment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ChatMessages_sentiment" AS ENUM (
    'positive',
    'neutral',
    'negative'
);


--
-- Name: enum_Topics_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Topics_category" AS ENUM (
    'learning',
    'wellbeing',
    'safety',
    'emotions',
    'news',
    'general'
);


--
-- Name: enum_badges_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_badges_category AS ENUM (
    'challenge',
    'quiz',
    'journal',
    'streak',
    'social',
    'exploration'
);


--
-- Name: enum_badges_rarity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_badges_rarity AS ENUM (
    'common',
    'rare',
    'epic',
    'legendary'
);


--
-- Name: enum_challenges_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_challenges_type AS ENUM (
    'multiple-choice',
    'text',
    'reflection',
    'activity',
    'quiz',
    'matching',
    'true-false',
    'short-answer'
);


--
-- Name: enum_children_challenges_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_children_challenges_difficulty AS ENUM (
    'easy',
    'medium',
    'hard'
);


--
-- Name: enum_children_challenges_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_children_challenges_type AS ENUM (
    'SELECT',
    'ASSIST',
    'MATCHING',
    'TRUE_FALSE'
);


--
-- Name: enum_children_courses_ageGroup; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_children_courses_ageGroup" AS ENUM (
    '8-10',
    '11-13',
    '14-16',
    '17-19'
);


--
-- Name: enum_children_courses_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_children_courses_category AS ENUM (
    'puberty',
    'periods',
    'body-safety',
    'boundaries',
    'emotions',
    'relationships',
    'hygiene',
    'general'
);


--
-- Name: enum_children_courses_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_children_courses_difficulty AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


--
-- Name: enum_comments_sentiment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_comments_sentiment AS ENUM (
    'positive',
    'neutral',
    'negative'
);


--
-- Name: enum_group_chats_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_group_chats_type AS ENUM (
    'text',
    'image',
    'video',
    'file',
    'emoji',
    'system'
);


--
-- Name: enum_group_members_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_group_members_role AS ENUM (
    'owner',
    'moderator',
    'member'
);


--
-- Name: enum_groups_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_groups_type AS ENUM (
    'public',
    'private',
    'interest-based'
);


--
-- Name: enum_journals_emotion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_journals_emotion AS ENUM (
    'happy',
    'sad',
    'angry',
    'anxious',
    'calm',
    'excited',
    'neutral',
    'confused',
    'motivated',
    'stressed'
);


--
-- Name: enum_leaderboards_period; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leaderboards_period AS ENUM (
    'all-time',
    'monthly',
    'weekly'
);


--
-- Name: enum_likes_targetType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_likes_targetType" AS ENUM (
    'discussion',
    'reply',
    'post'
);


--
-- Name: enum_news_stories_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_news_stories_category AS ENUM (
    'health',
    'safety',
    'education',
    'discovery',
    'general'
);


--
-- Name: enum_parental_accounts_contentFilter; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_parental_accounts_contentFilter" AS ENUM (
    'unrestricted',
    'moderate',
    'strict'
);


--
-- Name: enum_parental_accounts_relationship; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_parental_accounts_relationship AS ENUM (
    'parent',
    'guardian',
    'teacher'
);


--
-- Name: enum_posts_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_posts_category AS ENUM (
    'advice',
    'story',
    'question',
    'achievement',
    'resource',
    'news',
    'other'
);


--
-- Name: enum_posts_sentiment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_posts_sentiment AS ENUM (
    'positive',
    'neutral',
    'negative'
);


--
-- Name: enum_quiz_questions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_quiz_questions_type AS ENUM (
    'multiple-choice',
    'true-false',
    'short-answer',
    'matching',
    'fill-blank'
);


--
-- Name: enum_quizzes_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_quizzes_category AS ENUM (
    'anxiety',
    'depression',
    'social',
    'academic',
    'family',
    'health',
    'identity',
    'general'
);


--
-- Name: enum_quizzes_difficultyLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_quizzes_difficultyLevel" AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


--
-- Name: enum_stories_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_stories_category AS ENUM (
    'anxiety',
    'depression',
    'social',
    'academic',
    'family',
    'health',
    'identity',
    'general'
);


--
-- Name: enum_stories_difficultyLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_stories_difficultyLevel" AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


--
-- Name: enum_thread_replies_markedAs; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_thread_replies_markedAs" AS ENUM (
    'best_answer',
    'helpful',
    'off_topic'
);


--
-- Name: enum_thread_replies_sentiment; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_thread_replies_sentiment AS ENUM (
    'positive',
    'neutral',
    'negative'
);


--
-- Name: enum_threads_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_threads_category AS ENUM (
    'discussion',
    'question',
    'announcement',
    'resource',
    'event',
    'other'
);


--
-- Name: enum_threads_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_threads_status AS ENUM (
    'open',
    'closed',
    'archived'
);


--
-- Name: enum_user_story_progresses_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_user_story_progresses_status AS ENUM (
    'not-started',
    'in-progress',
    'completed'
);


--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other',
    'prefer-not'
);


--
-- Name: enum_users_oauthProvider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_users_oauthProvider" AS ENUM (
    'google',
    'local'
);


--
-- Name: enum_users_userType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_users_userType" AS ENUM (
    'child',
    'teenager',
    'counselor',
    'parent'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ChatMessages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMessages" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    message text NOT NULL,
    sender public."enum_ChatMessages_sender" DEFAULT 'user'::public."enum_ChatMessages_sender" NOT NULL,
    "botResponse" text,
    sentiment public."enum_ChatMessages_sentiment" DEFAULT 'neutral'::public."enum_ChatMessages_sentiment",
    tags json DEFAULT '[]'::json,
    "isHelpful" boolean,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: Topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Topics" (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    category public."enum_Topics_category" DEFAULT 'general'::public."enum_Topics_category",
    "imageUrl" character varying(255),
    icon character varying(255),
    "storyCount" integer DEFAULT 0,
    "isPublished" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN "Topics".icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Topics".icon IS 'Emoji or icon for topic';


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    icon character varying(255),
    category public.enum_badges_category DEFAULT 'challenge'::public.enum_badges_category,
    requirement jsonb NOT NULL,
    rarity public.enum_badges_rarity DEFAULT 'common'::public.enum_badges_rarity,
    points integer DEFAULT 10,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN badges.requirement; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.badges.requirement IS 'E.g., { type: "quiz_score", value: 80, count: 5 }';


--
-- Name: COLUMN badges.points; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.badges.points IS 'Points awarded when badge is earned';


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid NOT NULL,
    "lessonId" uuid NOT NULL,
    sequence integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    type public.enum_challenges_type DEFAULT 'reflection'::public.enum_challenges_type NOT NULL,
    prompt text NOT NULL,
    options jsonb,
    "correctAnswer" jsonb,
    feedback jsonb,
    hints jsonb DEFAULT '[]'::jsonb,
    "estimatedDuration" integer,
    points integer DEFAULT 10 NOT NULL,
    "isOptional" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN challenges.sequence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges.sequence IS 'Order of challenge within lesson';


--
-- Name: COLUMN challenges.prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges.prompt IS 'The challenge prompt or question';


--
-- Name: COLUMN challenges.options; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges.options IS 'Array of options (for multiple-choice, matching, etc.)';


--
-- Name: COLUMN challenges."correctAnswer"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges."correctAnswer" IS 'Correct answer(s) for validation';


--
-- Name: COLUMN challenges.feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges.feedback IS 'Feedback for correct and incorrect answers';


--
-- Name: COLUMN challenges.hints; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges.hints IS 'Array of optional hints for the challenge';


--
-- Name: COLUMN challenges."estimatedDuration"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.challenges."estimatedDuration" IS 'Estimated time to complete in minutes';


--
-- Name: children_challenge_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_challenge_options (
    id uuid NOT NULL,
    "challengeId" uuid NOT NULL,
    text text NOT NULL,
    correct boolean DEFAULT false NOT NULL,
    "imageSrc" character varying(255),
    "audioSrc" character varying(255),
    feedback text,
    "order" integer DEFAULT 1 NOT NULL,
    "nextChallengeId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_challenge_options.text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options.text IS 'Option text';


--
-- Name: COLUMN children_challenge_options.correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options.correct IS 'Is this the correct answer?';


--
-- Name: COLUMN children_challenge_options."imageSrc"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options."imageSrc" IS 'Option image (optional)';


--
-- Name: COLUMN children_challenge_options."audioSrc"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options."audioSrc" IS 'Option audio (optional)';


--
-- Name: COLUMN children_challenge_options.feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options.feedback IS 'Feedback shown after selection';


--
-- Name: COLUMN children_challenge_options."nextChallengeId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_options."nextChallengeId" IS 'Next story node to branch to (for interactive stories)';


--
-- Name: children_challenge_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_challenge_progress (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "challengeId" uuid NOT NULL,
    completed boolean DEFAULT false,
    correct boolean,
    attempts integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN children_challenge_progress.correct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_progress.correct IS 'True if answered correctly';


--
-- Name: COLUMN children_challenge_progress.attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenge_progress.attempts IS 'Number of attempts';


--
-- Name: children_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_challenges (
    id uuid NOT NULL,
    "lessonId" uuid NOT NULL,
    type public.enum_children_challenges_type DEFAULT 'SELECT'::public.enum_children_challenges_type NOT NULL,
    question text NOT NULL,
    hint text,
    "imageSrc" character varying(255),
    "order" integer DEFAULT 1 NOT NULL,
    difficulty public.enum_children_challenges_difficulty DEFAULT 'easy'::public.enum_children_challenges_difficulty,
    "isPublished" boolean DEFAULT true,
    "isStoryNode" boolean DEFAULT false,
    "storyContextImage" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_challenges.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenges.type IS 'Question type';


--
-- Name: COLUMN children_challenges.question; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenges.question IS 'Quiz question text';


--
-- Name: COLUMN children_challenges."imageSrc"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenges."imageSrc" IS 'Optional image for the question';


--
-- Name: COLUMN children_challenges."isStoryNode"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenges."isStoryNode" IS 'Is this an interactive story choice node?';


--
-- Name: COLUMN children_challenges."storyContextImage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_challenges."storyContextImage" IS 'Story narrative/context displayed above choices';


--
-- Name: children_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_courses (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    "imageSrc" character varying(255),
    icon character varying(50) DEFAULT '📚'::character varying,
    "ageGroup" public."enum_children_courses_ageGroup" DEFAULT '11-13'::public."enum_children_courses_ageGroup" NOT NULL,
    category public.enum_children_courses_category DEFAULT 'general'::public.enum_children_courses_category NOT NULL,
    difficulty public.enum_children_courses_difficulty DEFAULT 'beginner'::public.enum_children_courses_difficulty,
    "isPublished" boolean DEFAULT true,
    "order" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_courses.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_courses.title IS 'Course title (e.g., "Understanding Your Body")';


--
-- Name: COLUMN children_courses.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_courses.description IS 'Course overview';


--
-- Name: COLUMN children_courses."imageSrc"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_courses."imageSrc" IS 'Course cover image';


--
-- Name: COLUMN children_courses."ageGroup"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_courses."ageGroup" IS 'Target age group';


--
-- Name: children_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_lessons (
    id uuid NOT NULL,
    "unitId" uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    content text,
    "imageSrc" character varying(255),
    "videoUrl" character varying(255),
    icon character varying(50) DEFAULT '📝'::character varying,
    "order" integer DEFAULT 1 NOT NULL,
    duration integer DEFAULT 5,
    "isPublished" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_lessons.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_lessons.title IS 'Lesson title';


--
-- Name: COLUMN children_lessons.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_lessons.content IS 'Lesson educational content/story';


--
-- Name: COLUMN children_lessons.duration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_lessons.duration IS 'Lesson duration in minutes';


--
-- Name: children_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_progress (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "activeCourseId" uuid,
    hearts integer DEFAULT 5,
    points integer DEFAULT 0,
    "completedLessons" jsonb DEFAULT '[]'::jsonb,
    "completedChallenges" jsonb DEFAULT '[]'::jsonb,
    "totalPoints" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_progress.hearts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_progress.hearts IS 'Lives/hearts - lose 1 for wrong answer';


--
-- Name: COLUMN children_progress.points; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_progress.points IS 'Total points earned';


--
-- Name: COLUMN children_progress."completedLessons"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_progress."completedLessons" IS 'Array of completed lesson IDs';


--
-- Name: COLUMN children_progress."completedChallenges"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_progress."completedChallenges" IS 'Array of completed challenge IDs';


--
-- Name: children_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.children_units (
    id uuid NOT NULL,
    "courseId" uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    icon character varying(50) DEFAULT '📖'::character varying,
    "order" integer DEFAULT 1 NOT NULL,
    "isPublished" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN children_units.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_units.title IS 'Unit title (e.g., "Before Puberty")';


--
-- Name: COLUMN children_units.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.children_units.description IS 'What this unit teaches';


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    "postId" uuid,
    "userId" uuid NOT NULL,
    "parentCommentId" uuid,
    content text NOT NULL,
    "isAnonymous" boolean DEFAULT false,
    "anonymousName" character varying(255),
    sentiment public.enum_comments_sentiment DEFAULT 'neutral'::public.enum_comments_sentiment,
    "likeCount" integer DEFAULT 0,
    "isApproved" boolean DEFAULT true,
    "isReported" boolean DEFAULT false,
    "reportReasons" json DEFAULT '[]'::json,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    "user1Id" uuid NOT NULL,
    "user2Id" uuid NOT NULL,
    "messageCount" integer DEFAULT 0 NOT NULL,
    "lastMessageAt" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.direct_messages (
    id uuid NOT NULL,
    "conversationId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp with time zone,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: discussion_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussion_replies (
    id uuid NOT NULL,
    "discussionId" uuid NOT NULL,
    "creatorId" uuid,
    "parentReplyId" uuid,
    content text NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp with time zone,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN discussion_replies."parentReplyId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.discussion_replies."parentReplyId" IS 'For nested/threaded replies';


--
-- Name: discussions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussions (
    id uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "creatorId" uuid,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isClosed" boolean DEFAULT false NOT NULL,
    "replyCount" integer DEFAULT 0 NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "lastActivityAt" timestamp with time zone,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: group_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_chats (
    id uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "senderId" uuid,
    content text NOT NULL,
    type public.enum_group_chats_type DEFAULT 'text'::public.enum_group_chats_type NOT NULL,
    metadata jsonb,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN group_chats.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.group_chats.metadata IS 'For media/file metadata';


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role public.enum_group_members_role DEFAULT 'member'::public.enum_group_members_role NOT NULL,
    "joinedAt" timestamp with time zone NOT NULL,
    "lastReadAt" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN group_members."lastReadAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.group_members."lastReadAt" IS 'Last time user read messages in group';


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "creatorId" uuid NOT NULL,
    type public.enum_groups_type DEFAULT 'public'::public.enum_groups_type NOT NULL,
    category character varying(50),
    icon character varying(50),
    "memberCount" integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastActivityAt" timestamp with time zone,
    "avatarUrl" character varying(255),
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN groups.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.groups.category IS 'e.g., mental-health, academics, hobbies, support';


--
-- Name: COLUMN groups.icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.groups.icon IS 'Emoji or icon identifier';


--
-- Name: journals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journals (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    title character varying(200),
    content text NOT NULL,
    emotion public.enum_journals_emotion,
    tags jsonb DEFAULT '[]'::jsonb,
    prompt text,
    "isPrivate" boolean DEFAULT true NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    "entryDate" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN journals.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.journals.tags IS 'Array of tags for categorizing journal entry (e.g., ["reflection", "gratitude", "goals"])';


--
-- Name: COLUMN journals.prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.journals.prompt IS 'The journal prompt (if any) that guided this entry';


--
-- Name: COLUMN journals."isPrivate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.journals."isPrivate" IS 'Whether this journal entry is private or can be shared';


--
-- Name: COLUMN journals.attachments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.journals.attachments IS 'Array of attachment objects (e.g., images, audio)';


--
-- Name: leaderboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboards (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    period public.enum_leaderboards_period DEFAULT 'all-time'::public.enum_leaderboards_period NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "quizzesCompleted" integer DEFAULT 0 NOT NULL,
    "storiesCompleted" integer DEFAULT 0 NOT NULL,
    "journalCount" integer DEFAULT 0 NOT NULL,
    "moodLogsCount" integer DEFAULT 0 NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    "lastActivityAt" timestamp with time zone,
    "periodStartAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN leaderboards.period; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leaderboards.period IS 'Leaderboard period';


--
-- Name: COLUMN leaderboards.streak; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leaderboards.streak IS 'Day streak of activity';


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid NOT NULL,
    "unitId" uuid NOT NULL,
    sequence integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    content text NOT NULL,
    "coverImage" character varying(255),
    "estimatedDuration" integer,
    tags jsonb DEFAULT '[]'::jsonb,
    "learningObjectives" jsonb,
    resources jsonb,
    "challengeCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN lessons.sequence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.sequence IS 'Order of lesson within unit';


--
-- Name: COLUMN lessons."estimatedDuration"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons."estimatedDuration" IS 'Estimated time to complete lesson in minutes';


--
-- Name: COLUMN lessons."learningObjectives"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons."learningObjectives" IS 'Array of learning objectives for this lesson';


--
-- Name: COLUMN lessons.resources; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.lessons.resources IS 'Array of additional resources (links, documents, etc.)';


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "targetType" public."enum_likes_targetType" NOT NULL,
    "targetId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN likes."targetType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.likes."targetType" IS 'Type of content being liked';


--
-- Name: COLUMN likes."targetId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.likes."targetId" IS 'ID of the content (discussion/reply/post)';


--
-- Name: news_stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_stories (
    id uuid NOT NULL,
    title character varying(300) NOT NULL,
    description text,
    content text,
    category public.enum_news_stories_category DEFAULT 'general'::public.enum_news_stories_category,
    "topicId" uuid,
    "sourceArticleUrl" character varying(255),
    "sourceArticleTitle" character varying(255),
    "imageUrl" character varying(255),
    "storyJson" jsonb,
    "viewCount" integer DEFAULT 0,
    "isPublished" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN news_stories.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.news_stories.content IS 'Full story content';


--
-- Name: COLUMN news_stories."sourceArticleUrl"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.news_stories."sourceArticleUrl" IS 'Original news article URL';


--
-- Name: COLUMN news_stories."storyJson"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.news_stories."storyJson" IS 'AI-generated story scenes and choices';


--
-- Name: parental_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parental_accounts (
    id uuid NOT NULL,
    "childUserId" uuid NOT NULL,
    "parentUserId" uuid NOT NULL,
    relationship public.enum_parental_accounts_relationship DEFAULT 'parent'::public.enum_parental_accounts_relationship,
    permissions jsonb DEFAULT '{"canViewMood": true, "canViewJournal": true, "canBlockContent": true, "canViewActivity": true, "canViewProgress": true, "canSetScreenTime": true, "canManageContacts": false}'::jsonb,
    "screenTimeLimit" integer DEFAULT 120,
    "contentFilter" public."enum_parental_accounts_contentFilter" DEFAULT 'moderate'::public."enum_parental_accounts_contentFilter",
    "blockedUsers" jsonb DEFAULT '[]'::jsonb,
    "allowNotifications" boolean DEFAULT true,
    "isActive" boolean DEFAULT true,
    "approvedAt" timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN parental_accounts.permissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parental_accounts.permissions IS 'Granular permissions for parental controls';


--
-- Name: COLUMN parental_accounts."screenTimeLimit"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parental_accounts."screenTimeLimit" IS 'Daily screen time limit in minutes';


--
-- Name: COLUMN parental_accounts."blockedUsers"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parental_accounts."blockedUsers" IS 'Array of blocked user IDs';


--
-- Name: COLUMN parental_accounts."approvedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parental_accounts."approvedAt" IS 'When child approved parental oversight';


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "groupId" uuid,
    title character varying(255),
    content text NOT NULL,
    "isAnonymous" boolean DEFAULT false,
    "anonymousName" character varying(255),
    media json DEFAULT '[]'::json,
    category public.enum_posts_category DEFAULT 'other'::public.enum_posts_category,
    sentiment public.enum_posts_sentiment DEFAULT 'neutral'::public.enum_posts_sentiment,
    "likeCount" integer DEFAULT 0,
    "commentCount" integer DEFAULT 0,
    "shareCount" integer DEFAULT 0,
    "isApproved" boolean DEFAULT true,
    "isReported" boolean DEFAULT false,
    "reportReasons" json DEFAULT '[]'::json,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: quiz_progresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_progresses (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "quizId" uuid NOT NULL,
    attempt integer DEFAULT 1 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    "pointsEarned" integer DEFAULT 0 NOT NULL,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    "timeSpent" integer,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN quiz_progresses.attempt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_progresses.attempt IS 'Attempt number for this quiz';


--
-- Name: COLUMN quiz_progresses."timeSpent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_progresses."timeSpent" IS 'Time spent in seconds';


--
-- Name: COLUMN quiz_progresses.answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_progresses.answers IS 'User answers indexed by question ID';


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id uuid NOT NULL,
    "quizId" uuid NOT NULL,
    sequence integer NOT NULL,
    type public.enum_quiz_questions_type DEFAULT 'multiple-choice'::public.enum_quiz_questions_type NOT NULL,
    prompt text NOT NULL,
    options jsonb,
    "correctAnswer" jsonb NOT NULL,
    explanation text,
    points integer DEFAULT 1 NOT NULL,
    hints jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN quiz_questions.sequence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_questions.sequence IS 'Order of question within quiz';


--
-- Name: COLUMN quiz_questions.prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_questions.prompt IS 'The question text';


--
-- Name: COLUMN quiz_questions.options; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_questions.options IS 'Array of options for multiple-choice/true-false/matching';


--
-- Name: COLUMN quiz_questions."correctAnswer"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_questions."correctAnswer" IS 'The correct answer(s)';


--
-- Name: COLUMN quiz_questions.explanation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quiz_questions.explanation IS 'Explanation shown after answer';


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    category public.enum_quizzes_category DEFAULT 'general'::public.enum_quizzes_category NOT NULL,
    "difficultyLevel" public."enum_quizzes_difficultyLevel" DEFAULT 'beginner'::public."enum_quizzes_difficultyLevel" NOT NULL,
    "timeLimit" integer,
    "passingScore" integer DEFAULT 70 NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "questionCount" integer DEFAULT 0 NOT NULL,
    "totalPoints" integer DEFAULT 100 NOT NULL,
    "attemptCount" integer DEFAULT 0 NOT NULL,
    "averageScore" double precision DEFAULT '0'::double precision NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN quizzes."timeLimit"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quizzes."timeLimit" IS 'Time limit in minutes';


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "tokenFamily" uuid NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "revokedAt" timestamp with time zone,
    "ipAddress" character varying(255),
    "userAgent" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN refresh_tokens."tokenFamily"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens."tokenFamily" IS 'Groups all tokens from same login session';


--
-- Name: COLUMN refresh_tokens."expiresAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens."expiresAt" IS 'When this refresh token expires';


--
-- Name: COLUMN refresh_tokens."revokedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens."revokedAt" IS 'When this token was revoked (logout or compromised)';


--
-- Name: COLUMN refresh_tokens."ipAddress"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens."ipAddress" IS 'IP address that issued this token';


--
-- Name: COLUMN refresh_tokens."userAgent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.refresh_tokens."userAgent" IS 'User-Agent header (browser/platform info)';


--
-- Name: stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stories (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    content text,
    "coverImage" character varying(255),
    category public.enum_stories_category DEFAULT 'general'::public.enum_stories_category NOT NULL,
    "topicId" uuid,
    "targetAgeMin" integer,
    "targetAgeMax" integer,
    "difficultyLevel" public."enum_stories_difficultyLevel" DEFAULT 'beginner'::public."enum_stories_difficultyLevel" NOT NULL,
    "estimatedDuration" integer,
    "isPublished" boolean DEFAULT false NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "completionCount" integer DEFAULT 0 NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN stories.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stories.content IS 'Core narrative content of the story';


--
-- Name: COLUMN stories."topicId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stories."topicId" IS 'Reference to Topic for organizing stories';


--
-- Name: COLUMN stories."estimatedDuration"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stories."estimatedDuration" IS 'Estimated time to complete in minutes';


--
-- Name: COLUMN stories.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.stories.metadata IS 'Additional metadata (author, source, keywords, etc.)';


--
-- Name: thread_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thread_replies (
    id uuid NOT NULL,
    "threadId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "parentReplyId" uuid,
    content text NOT NULL,
    "isAnonymous" boolean DEFAULT false,
    "anonymousName" character varying(255),
    media json DEFAULT '[]'::json,
    "isMarked" boolean DEFAULT false,
    "markedAs" public."enum_thread_replies_markedAs",
    sentiment public.enum_thread_replies_sentiment DEFAULT 'neutral'::public.enum_thread_replies_sentiment,
    "likeCount" integer DEFAULT 0,
    "isApproved" boolean DEFAULT true,
    "isReported" boolean DEFAULT false,
    "reportReasons" json DEFAULT '[]'::json,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threads (
    id uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "creatorId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    status public.enum_threads_status DEFAULT 'open'::public.enum_threads_status,
    "isPinned" boolean DEFAULT false,
    "isResolved" boolean DEFAULT false,
    category public.enum_threads_category DEFAULT 'discussion'::public.enum_threads_category,
    tags json DEFAULT '[]'::json,
    "replyCount" integer DEFAULT 0,
    "viewCount" integer DEFAULT 0,
    "likeCount" integer DEFAULT 0,
    "lastActivityAt" timestamp with time zone,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    id uuid NOT NULL,
    "storyId" uuid NOT NULL,
    sequence integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    "coverImage" character varying(255),
    "estimatedDuration" integer,
    "lessonCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN units.sequence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units.sequence IS 'Order of unit within story';


--
-- Name: COLUMN units."estimatedDuration"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.units."estimatedDuration" IS 'Estimated time to complete unit in minutes';


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "badgeId" uuid NOT NULL,
    "unlockedAt" timestamp with time zone,
    progress integer DEFAULT 0,
    "isCompleted" boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN user_achievements."unlockedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_achievements."unlockedAt" IS 'When the achievement was earned';


--
-- Name: COLUMN user_achievements.progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_achievements.progress IS 'Current progress towards unlocking (0-100)';


--
-- Name: COLUMN user_achievements.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_achievements.metadata IS 'Additional data like completion details, context';


--
-- Name: user_story_progresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_story_progresses (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "storyId" uuid NOT NULL,
    "unitId" uuid,
    "lessonId" uuid,
    "challengeId" uuid,
    status public.enum_user_story_progresses_status DEFAULT 'not-started'::public.enum_user_story_progresses_status NOT NULL,
    "pointsEarned" integer DEFAULT 0 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp with time zone,
    "startedAt" timestamp with time zone,
    metadata jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


--
-- Name: COLUMN user_story_progresses.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_story_progresses.metadata IS 'Additional progress data (answers, notes, etc.)';


--
-- Name: story_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_attempts (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "storyId" uuid NOT NULL,
    "topicId" uuid,
    "questionIndex" integer NOT NULL,
    "userAnswer" text NOT NULL,
    "correctAnswer" text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL,
    "scenarioContext" jsonb DEFAULT '{}'::jsonb,
    "emotionDetected" character varying(255),
    "emotionConfidence" double precision,
    "emotionIntensity" integer,
    "aiRecommendation" jsonb DEFAULT '{}'::jsonb,
    "weaknessTopics" uuid[] DEFAULT '{}'::uuid[],
    "timeSpent" integer,
    "attemptsCount" integer DEFAULT 1 NOT NULL,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN story_attempts.scenarioContext; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."scenarioContext" IS 'Story context like which branches/choices were taken';


--
-- Name: COLUMN story_attempts.emotionDetected; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."emotionDetected" IS 'Emotion detected from facial emotion detector at moment of answer';


--
-- Name: COLUMN story_attempts.emotionConfidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."emotionConfidence" IS 'Confidence score of emotion detection (0-1)';


--
-- Name: COLUMN story_attempts.emotionIntensity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."emotionIntensity" IS 'User-reported or detected emotion intensity (1-10)';


--
-- Name: COLUMN story_attempts.aiRecommendation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."aiRecommendation" IS 'Gemini recommendation response - topics to focus on, learning path suggestions';


--
-- Name: COLUMN story_attempts.weaknessTopics; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."weaknessTopics" IS 'Array of topic IDs identified as areas needing more practice';


--
-- Name: COLUMN story_attempts.timeSpent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."timeSpent" IS 'Time spent on this question in seconds';


--
-- Name: COLUMN story_attempts.attemptsCount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_attempts."attemptsCount" IS 'How many times child attempted this specific question';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255),
    "firstName" character varying(255),
    "lastName" character varying(255),
    age integer,
    gender public.enum_users_gender DEFAULT 'prefer-not'::public.enum_users_gender,
    "userType" public."enum_users_userType",
    "oauthProvider" public."enum_users_oauthProvider",
    "googleId" character varying(255),
    "avatarUrl" text,
    "currentStars" integer DEFAULT 0,
    "isVerified" boolean DEFAULT false,
    "verifiedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN users."passwordHash"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users."passwordHash" IS 'bcryptjs hashed password (null for OAuth users)';


--
-- Name: COLUMN users."isVerified"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users."isVerified" IS 'Teen verification status (counselor-approved)';


--
-- Name: COLUMN users."verifiedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users."verifiedAt" IS 'When user was verified by counselor';


--
-- Name: ChatMessages ChatMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_pkey" PRIMARY KEY (id);


--
-- Name: Topics Topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topics"
    ADD CONSTRAINT "Topics_pkey" PRIMARY KEY (id);


--
-- Name: badges badges_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_name_key UNIQUE (name);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: children_challenge_options children_challenge_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_options
    ADD CONSTRAINT children_challenge_options_pkey PRIMARY KEY (id);


--
-- Name: children_challenge_progress children_challenge_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_progress
    ADD CONSTRAINT children_challenge_progress_pkey PRIMARY KEY (id);


--
-- Name: children_challenges children_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenges
    ADD CONSTRAINT children_challenges_pkey PRIMARY KEY (id);


--
-- Name: children_courses children_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_courses
    ADD CONSTRAINT children_courses_pkey PRIMARY KEY (id);


--
-- Name: children_lessons children_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_lessons
    ADD CONSTRAINT children_lessons_pkey PRIMARY KEY (id);


--
-- Name: children_progress children_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_progress
    ADD CONSTRAINT children_progress_pkey PRIMARY KEY (id);


--
-- Name: children_units children_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_units
    ADD CONSTRAINT children_units_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- Name: discussion_replies discussion_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT discussion_replies_pkey PRIMARY KEY (id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- Name: group_chats group_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: journals journals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (id);


--
-- Name: leaderboards leaderboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_pkey PRIMARY KEY (id);


--
-- Name: leaderboards leaderboards_userId_period_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT "leaderboards_userId_period_key" UNIQUE ("userId", period);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: news_stories news_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_stories
    ADD CONSTRAINT news_stories_pkey PRIMARY KEY (id);


--
-- Name: parental_accounts parental_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_accounts
    ADD CONSTRAINT parental_accounts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: quiz_progresses quiz_progresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_progresses
    ADD CONSTRAINT quiz_progresses_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: stories stories_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_title_key UNIQUE (title);


--
-- Name: thread_replies thread_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread_replies
    ADD CONSTRAINT thread_replies_pkey PRIMARY KEY (id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_story_progresses user_story_progresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT user_story_progresses_pkey PRIMARY KEY (id);


--
-- Name: story_attempts story_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_attempts
    ADD CONSTRAINT story_attempts_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_googleId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_googleId_key" UNIQUE ("googleId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: badges_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX badges_category ON public.badges USING btree (category);


--
-- Name: badges_rarity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX badges_rarity ON public.badges USING btree (rarity);


--
-- Name: challenges_lesson_id_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenges_lesson_id_sequence ON public.challenges USING btree ("lessonId", sequence);


--
-- Name: challenges_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenges_type ON public.challenges USING btree (type);


--
-- Name: conversations_last_message_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_last_message_at ON public.conversations USING btree ("lastMessageAt");


--
-- Name: conversations_user1_id_user2_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX conversations_user1_id_user2_id ON public.conversations USING btree ("user1Id", "user2Id");


--
-- Name: direct_messages_conversation_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX direct_messages_conversation_id_created_at ON public.direct_messages USING btree ("conversationId", "createdAt");


--
-- Name: direct_messages_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX direct_messages_is_read ON public.direct_messages USING btree ("isRead");


--
-- Name: direct_messages_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX direct_messages_sender_id ON public.direct_messages USING btree ("senderId");


--
-- Name: discussion_replies_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussion_replies_creator_id ON public.discussion_replies USING btree ("creatorId");


--
-- Name: discussion_replies_discussion_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussion_replies_discussion_id_created_at ON public.discussion_replies USING btree ("discussionId", "createdAt");


--
-- Name: discussion_replies_parent_reply_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussion_replies_parent_reply_id ON public.discussion_replies USING btree ("parentReplyId");


--
-- Name: discussions_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussions_creator_id ON public.discussions USING btree ("creatorId");


--
-- Name: discussions_group_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussions_group_id_created_at ON public.discussions USING btree ("groupId", "createdAt");


--
-- Name: discussions_group_id_is_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussions_group_id_is_pinned ON public.discussions USING btree ("groupId", "isPinned");


--
-- Name: discussions_is_closed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discussions_is_closed ON public.discussions USING btree ("isClosed");


--
-- Name: group_chats_group_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chats_group_id_created_at ON public.group_chats USING btree ("groupId", "createdAt");


--
-- Name: group_chats_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_chats_sender_id ON public.group_chats USING btree ("senderId");


--
-- Name: group_members_group_id_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_members_group_id_role ON public.group_members USING btree ("groupId", role);


--
-- Name: group_members_group_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX group_members_group_id_user_id ON public.group_members USING btree ("groupId", "userId");


--
-- Name: groups_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groups_category ON public.groups USING btree (category);


--
-- Name: groups_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groups_creator_id ON public.groups USING btree ("creatorId");


--
-- Name: groups_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groups_is_active ON public.groups USING btree ("isActive");


--
-- Name: groups_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groups_type ON public.groups USING btree (type);


--
-- Name: journals_emotion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journals_emotion ON public.journals USING btree (emotion);


--
-- Name: journals_is_private; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journals_is_private ON public.journals USING btree ("isPrivate");


--
-- Name: journals_user_id_entry_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journals_user_id_entry_date ON public.journals USING btree ("userId", "entryDate");


--
-- Name: leaderboards_period_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leaderboards_period_rank ON public.leaderboards USING btree (period, rank);


--
-- Name: leaderboards_total_points; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leaderboards_total_points ON public.leaderboards USING btree ("totalPoints");


--
-- Name: leaderboards_user_id_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leaderboards_user_id_period ON public.leaderboards USING btree ("userId", period);


--
-- Name: lessons_unit_id_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_unit_id_sequence ON public.lessons USING btree ("unitId", sequence);


--
-- Name: likes_target_type_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX likes_target_type_target_id ON public.likes USING btree ("targetType", "targetId");


--
-- Name: likes_user_id_target_type_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX likes_user_id_target_type_target_id ON public.likes USING btree ("userId", "targetType", "targetId");


--
-- Name: story_attempts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX story_attempts_user_id ON public.story_attempts USING btree ("userId");


--
-- Name: story_attempts_story_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX story_attempts_story_id ON public.story_attempts USING btree ("storyId");


--
-- Name: story_attempts_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX story_attempts_topic_id ON public.story_attempts USING btree ("topicId");


--
-- Name: story_attempts_is_correct; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX story_attempts_is_correct ON public.story_attempts USING btree ("isCorrect");


--
-- Name: story_attempts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX story_attempts_created_at ON public.story_attempts USING btree ("createdAt");


--
-- Name: parental_accounts_child_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parental_accounts_child_user_id ON public.parental_accounts USING btree ("childUserId");


--
-- Name: parental_accounts_child_user_id_parent_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parental_accounts_child_user_id_parent_user_id ON public.parental_accounts USING btree ("childUserId", "parentUserId");


--
-- Name: parental_accounts_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parental_accounts_is_active ON public.parental_accounts USING btree ("isActive");


--
-- Name: parental_accounts_parent_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parental_accounts_parent_user_id ON public.parental_accounts USING btree ("parentUserId");


--
-- Name: quiz_progresses_passed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_progresses_passed ON public.quiz_progresses USING btree (passed);


--
-- Name: quiz_progresses_user_id_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_progresses_user_id_completed_at ON public.quiz_progresses USING btree ("userId", "completedAt");


--
-- Name: quiz_progresses_user_id_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_progresses_user_id_quiz_id ON public.quiz_progresses USING btree ("userId", "quizId");


--
-- Name: quiz_questions_quiz_id_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quiz_questions_quiz_id_sequence ON public.quiz_questions USING btree ("quizId", sequence);


--
-- Name: quizzes_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quizzes_category ON public.quizzes USING btree (category);


--
-- Name: quizzes_difficulty_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quizzes_difficulty_level ON public.quizzes USING btree ("difficultyLevel");


--
-- Name: quizzes_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quizzes_is_published ON public.quizzes USING btree ("isPublished");


--
-- Name: refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_expires_at ON public.refresh_tokens USING btree ("expiresAt");


--
-- Name: refresh_tokens_revoked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_revoked_at ON public.refresh_tokens USING btree ("revokedAt");


--
-- Name: refresh_tokens_token_family; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token_family ON public.refresh_tokens USING btree ("tokenFamily");


--
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id ON public.refresh_tokens USING btree ("userId");


--
-- Name: stories_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stories_category ON public.stories USING btree (category);


--
-- Name: stories_difficulty_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stories_difficulty_level ON public.stories USING btree ("difficultyLevel");


--
-- Name: stories_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stories_is_published ON public.stories USING btree ("isPublished");


--
-- Name: stories_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stories_title ON public.stories USING btree (title);


--
-- Name: units_story_id_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX units_story_id_sequence ON public.units USING btree ("storyId", sequence);


--
-- Name: user_achievements_badge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_badge_id ON public.user_achievements USING btree ("badgeId");


--
-- Name: user_achievements_is_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_is_completed ON public.user_achievements USING btree ("isCompleted");


--
-- Name: user_achievements_unlocked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_unlocked_at ON public.user_achievements USING btree ("unlockedAt");


--
-- Name: user_achievements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_user_id ON public.user_achievements USING btree ("userId");


--
-- Name: user_achievements_user_id_badge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_achievements_user_id_badge_id ON public.user_achievements USING btree ("userId", "badgeId");


--
-- Name: user_story_progresses_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_story_progresses_completed_at ON public.user_story_progresses USING btree ("completedAt");


--
-- Name: user_story_progresses_user_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_story_progresses_user_id_status ON public.user_story_progresses USING btree ("userId", status);


--
-- Name: user_story_progresses_user_id_story_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_story_progresses_user_id_story_id ON public.user_story_progresses USING btree ("userId", "storyId");


--
-- Name: users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at ON public.users USING btree ("createdAt");


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email ON public.users USING btree (email);


--
-- Name: users_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_google_id ON public.users USING btree ("googleId");


--
-- Name: ChatMessages ChatMessages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: challenges challenges_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT "challenges_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_challenge_options children_challenge_options_challengeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_options
    ADD CONSTRAINT "children_challenge_options_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES public.children_challenges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_challenge_options children_challenge_options_nextChallengeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_options
    ADD CONSTRAINT "children_challenge_options_nextChallengeId_fkey" FOREIGN KEY ("nextChallengeId") REFERENCES public.children_challenges(id) ON DELETE SET NULL;


--
-- Name: children_challenge_progress children_challenge_progress_challengeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_progress
    ADD CONSTRAINT "children_challenge_progress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES public.children_challenges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_challenge_progress children_challenge_progress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenge_progress
    ADD CONSTRAINT "children_challenge_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_challenges children_challenges_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_challenges
    ADD CONSTRAINT "children_challenges_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.children_lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_lessons children_lessons_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_lessons
    ADD CONSTRAINT "children_lessons_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.children_units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_progress children_progress_activeCourseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_progress
    ADD CONSTRAINT "children_progress_activeCourseId_fkey" FOREIGN KEY ("activeCourseId") REFERENCES public.children_courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: children_progress children_progress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_progress
    ADD CONSTRAINT "children_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: children_units children_units_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.children_units
    ADD CONSTRAINT "children_units_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.children_courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_parentCommentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_user1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_user2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT "direct_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT "direct_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT "discussion_replies_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: discussion_replies discussion_replies_discussionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT "discussion_replies_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES public.discussions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_parentReplyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT "discussion_replies_parentReplyId_fkey" FOREIGN KEY ("parentReplyId") REFERENCES public.discussion_replies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: discussions discussions_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT "discussions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: discussions discussions_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT "discussions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chats group_chats_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT "group_chats_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_chats group_chats_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT "group_chats_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: group_members group_members_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_members group_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups groups_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "groups_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: journals journals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT "journals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leaderboards leaderboards_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT "leaderboards_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lessons lessons_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "lessons_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: likes likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: news_stories news_stories_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_stories
    ADD CONSTRAINT "news_stories_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topics"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parental_accounts parental_accounts_childUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_accounts
    ADD CONSTRAINT "parental_accounts_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parental_accounts parental_accounts_parentUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parental_accounts
    ADD CONSTRAINT "parental_accounts_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: posts posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_progresses quiz_progresses_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_progresses
    ADD CONSTRAINT "quiz_progresses_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_progresses quiz_progresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_progresses
    ADD CONSTRAINT "quiz_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stories stories_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT "stories_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topics"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: thread_replies thread_replies_parentReplyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread_replies
    ADD CONSTRAINT "thread_replies_parentReplyId_fkey" FOREIGN KEY ("parentReplyId") REFERENCES public.thread_replies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: thread_replies thread_replies_threadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread_replies
    ADD CONSTRAINT "thread_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public.threads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: thread_replies thread_replies_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread_replies
    ADD CONSTRAINT "thread_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: threads threads_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT "threads_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: threads threads_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT "threads_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: units units_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT "units_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_badgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "user_achievements_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public.badges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_story_progresses user_story_progresses_challengeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT "user_story_progresses_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES public.challenges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_story_progresses user_story_progresses_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT "user_story_progresses_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_story_progresses user_story_progresses_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT "user_story_progresses_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_story_progresses user_story_progresses_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT "user_story_progresses_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_story_progresses user_story_progresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_story_progresses
    ADD CONSTRAINT "user_story_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: story_attempts story_attempts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_attempts
    ADD CONSTRAINT "story_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: story_attempts story_attempts_storyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_attempts
    ADD CONSTRAINT "story_attempts_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES public.stories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: story_attempts story_attempts_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_attempts
    ADD CONSTRAINT "story_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topics"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: enum_PsychiatristChat_sender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PsychiatristChat_sender" AS ENUM (
    'teen',
    'psychiatrist'
);


--
-- Name: psychiatrists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.psychiatrists (
    id uuid NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    specialization text,
    bio text,
    "avatarUrl" character varying(500),
    rating numeric(3,2) DEFAULT 4.5,
    "isAvailable" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: psychiatrist_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.psychiatrist_chats (
    id uuid NOT NULL,
    "conversationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "psychiatristId" uuid NOT NULL,
    message text NOT NULL,
    sender public."enum_PsychiatristChat_sender" NOT NULL,
    sentiment character varying(50) DEFAULT 'neutral',
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: psychiatrist_chats psychiatrist_chats_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.psychiatrist_chats
    ADD CONSTRAINT "psychiatrist_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: psychiatrist_chats psychiatrist_chats_psychiatristId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.psychiatrist_chats
    ADD CONSTRAINT "psychiatrist_chats_psychiatristId_fkey" FOREIGN KEY ("psychiatristId") REFERENCES public.psychiatrists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


