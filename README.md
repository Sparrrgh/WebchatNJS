Project created by Massimiliano Bellia and Claudia Luisa Crippa for the web programming course at the University of Milan 'La Statale'.

The project is a webchat coded in Javascript following the MVC pattern.
It has a registration and login system, created with passport and PostgreSQL.
The database stores the users for the login system, the messages sent and the rooms created by the users.
The input is sanitized using DOMpurify in the backend.

Requirements:

	express
		npm install express --save
	PostgreSQL
	PgAdmin 4
		 npm install pg
	passport
		npm install passport --save
	passport-local
		npm install passport --save
	bcryptjs
		npm install bcryptjs --save
	express-session
		npm install express-session --save
	dompurify
		npm install dompurify --save
	jsdom
		npm install jsdom --save


Table creation queries:

-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying(255),
  password character varying(100),
  room text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_username_key UNIQUE (username)
)
WITH (
  OIDS=FALSE
);


-- Table: public.rooms

-- DROP TABLE public.rooms;

CREATE TABLE public.rooms
(
  name text NOT NULL,
  id integer NOT NULL DEFAULT nextval('rooms_id_room_seq'::regclass)
)
WITH (
  OIDS=FALSE
);


-- Table: public.messages

-- DROP TABLE public.messages;

CREATE TABLE public.messages
(
  id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  value text NOT NULL,
  room text NOT NULL,
  "time" text NOT NULL,
  username text,
  CONSTRAINT messages_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);


		 

		
