-- SEQUENCE: public.users_id_seq

-- DROP SEQUENCE IF EXISTS public.users_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.users_id_seq
    OWNED BY public.users.id;

ALTER SEQUENCE public.users_id_seq
    OWNER TO postgres;

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    fname character varying(100) COLLATE pg_catalog."default" NOT NULL,
    lname character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    userid text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_userid_key UNIQUE (userid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- SEQUENCE: public.sublease_id_seq

-- DROP SEQUENCE IF EXISTS public.sublease_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.sublease_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.sublease_id_seq
    OWNED BY public.sublease.id;

ALTER SEQUENCE public.sublease_id_seq
    OWNER TO postgres;

-- Table: public.sublease

-- DROP TABLE IF EXISTS public.sublease;

CREATE TABLE IF NOT EXISTS public.sublease
(
    id integer NOT NULL DEFAULT nextval('sublease_id_seq'::regclass),
    listerid text COLLATE pg_catalog."default" NOT NULL,
    price double precision NOT NULL,
    gender text COLLATE pg_catalog."default" NOT NULL,
    roomcount integer NOT NULL,
    bathroomcount NUMERIC(3,1) NOT NULL,
    street_name text COLLATE pg_catalog."default" NOT NULL,
    city text COLLATE pg_catalog."default" NOT NULL,
    room text COLLATE pg_catalog."default",
    postal_code text COLLATE pg_catalog."default" NOT NULL,
    startterm text COLLATE pg_catalog."default" NOT NULL,
    endterm text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    subleaseid text COLLATE pg_catalog."default" NOT NULL,
    latitude double precision,
    longitude double precision,
    CONSTRAINT sublease_pkey PRIMARY KEY (id),
    CONSTRAINT sublease_latitude_check CHECK (latitude >= '-90'::integer::double precision AND latitude <= 90::double precision),
    CONSTRAINT sublease_longitude_check CHECK (longitude >= '-180'::integer::double precision AND longitude <= 180::double precision)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.sublease
    OWNER to postgres;

-- Table: public.activity

-- DROP TABLE IF EXISTS public.activity;

CREATE TABLE IF NOT EXISTS public.activity
(
    id UUID PRIMARY KEY,
    listerid UUID NOT NULL,
    activity TEXT NOT NULL,
    date DATE NOT NULL
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.activity
    OWNER to postgres;

-- Create an index on the listerid column to improve query performance
CREATE INDEX IF NOT EXISTS idx_activity_listerid ON public.activity (listerid);

-- SEQUENCE: public.chatrooms_id_seq

-- DROP SEQUENCE IF EXISTS public.chatrooms_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.chatrooms_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.chatrooms_id_seq
    OWNED BY public.chatrooms.id;

ALTER SEQUENCE public.chatrooms_id_seq
    OWNER TO postgres;

-- Table: public.chatrooms

-- DROP TABLE IF EXISTS public.chatrooms;

CREATE TABLE IF NOT EXISTS public.chatrooms
(
    id integer NOT NULL DEFAULT nextval('chatrooms_id_seq'::regclass),
    chatroomid text COLLATE pg_catalog."default" NOT NULL,
    userid1 text COLLATE pg_catalog."default" NOT NULL,
    userid2 text COLLATE pg_catalog."default" NOT NULL,
    unreadcount1 integer DEFAULT 0,
    unreadcount2 integer DEFAULT 0,
    CONSTRAINT chatrooms_pkey PRIMARY KEY (id),
    CONSTRAINT chatrooms_userid1_userid2_key UNIQUE (userid1, userid2),
    CONSTRAINT chatrooms_check CHECK (userid1 <> userid2)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.chatrooms
    OWNER to postgres;

-- Table: public.messages

-- DROP TABLE IF EXISTS public.messages;

CREATE TABLE IF NOT EXISTS public.messages
(
    id text COLLATE pg_catalog."default" NOT NULL,
    chatroomid text COLLATE pg_catalog."default" NOT NULL,
    sender text COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status text COLLATE pg_catalog."default" DEFAULT 'sent'::text,
    CONSTRAINT messages_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.messages
    OWNER to postgres;

-- Table: public.refresh_token_blacklist

-- DROP TABLE IF EXISTS public.refresh_token_blacklist;

CREATE TABLE IF NOT EXISTS public.refresh_token_blacklist
(
    token_id uuid NOT NULL,
    expiry timestamp without time zone NOT NULL,
    CONSTRAINT refresh_token_blacklist_pkey PRIMARY KEY (token_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.refresh_token_blacklist
    OWNER to postgres;

-- Index: idx_expiry

-- DROP INDEX IF EXISTS public.idx_expiry;

CREATE INDEX IF NOT EXISTS idx_expiry
    ON public.refresh_token_blacklist USING btree
    (expiry ASC NULLS LAST)
    TABLESPACE pg_default;