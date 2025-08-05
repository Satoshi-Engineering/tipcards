--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:7CW+JikZSeg5zfwCaKSt0g==$TXWeRvX5qO6/wzB6e+HBzs07rqNkWppmmRgotPN4Rco=:bOTxKsV3oIWfTfSVMrPWwSBF5woRE8VX7CpndiKrJrA=';
CREATE ROLE tipcards;
ALTER ROLE tipcards WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:yfzo3bRs6AZ/kjtaPdOzOQ==$jos7nL4qvi32gcswxtx83X+HejVx3KIXSs1zeBtQZXM=:PBj/I00w1nAOiVXAW7KbuDSeVPtaapAzIN/ioi7WHoU=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

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
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

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
-- PostgreSQL database dump complete
--

--
-- Database "tipcards" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

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
-- Name: tipcards; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE tipcards WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE tipcards OWNER TO postgres;

\connect tipcards

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
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: tipcards
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO tipcards;

--
-- Name: imageType; Type: TYPE; Schema: public; Owner: tipcards
--

CREATE TYPE public."imageType" AS ENUM (
    'svg',
    'png'
);


ALTER TYPE public."imageType" OWNER TO tipcards;

--
-- Name: landingPageType; Type: TYPE; Schema: public; Owner: tipcards
--

CREATE TYPE public."landingPageType" AS ENUM (
    'core',
    'external'
);


ALTER TYPE public."landingPageType" OWNER TO tipcards;

--
-- Name: permission; Type: TYPE; Schema: public; Owner: tipcards
--

CREATE TYPE public.permission AS ENUM (
    'statistics',
    'support'
);


ALTER TYPE public.permission OWNER TO tipcards;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: tipcards
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO tipcards;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: tipcards
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO tipcards;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: tipcards
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: AllowedSession; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."AllowedSession" (
    "user" character varying(64) NOT NULL,
    "sessionId" character varying(36) NOT NULL
);


ALTER TABLE public."AllowedSession" OWNER TO tipcards;

--
-- Name: Card; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."Card" (
    hash character varying(64) NOT NULL,
    created timestamp with time zone NOT NULL,
    set character varying(36)
);


ALTER TABLE public."Card" OWNER TO tipcards;

--
-- Name: CardVersion; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."CardVersion" (
    id character varying(36) NOT NULL,
    card character varying(64) NOT NULL,
    created timestamp with time zone NOT NULL,
    "lnurlP" character varying(36),
    "lnurlW" character varying(36),
    "textForWithdraw" text NOT NULL,
    "noteForStatusPage" text NOT NULL,
    "sharedFunding" boolean NOT NULL,
    "landingPageViewed" timestamp with time zone
);


ALTER TABLE public."CardVersion" OWNER TO tipcards;

--
-- Name: CardVersionHasInvoice; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."CardVersionHasInvoice" (
    "cardVersion" character varying(36) NOT NULL,
    invoice character varying(64) NOT NULL
);


ALTER TABLE public."CardVersionHasInvoice" OWNER TO tipcards;

--
-- Name: Image; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."Image" (
    id character varying(36) NOT NULL,
    type public."imageType" NOT NULL,
    name text NOT NULL,
    data text NOT NULL
);


ALTER TABLE public."Image" OWNER TO tipcards;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."Invoice" (
    amount integer NOT NULL,
    "paymentHash" character varying(64) NOT NULL,
    "paymentRequest" text NOT NULL,
    created timestamp with time zone NOT NULL,
    paid timestamp with time zone,
    "expiresAt" timestamp with time zone NOT NULL,
    extra text NOT NULL,
    "feeAmount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO tipcards;

--
-- Name: LandingPage; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."LandingPage" (
    id character varying(36) NOT NULL,
    type public."landingPageType" NOT NULL,
    name text NOT NULL,
    url text
);


ALTER TABLE public."LandingPage" OWNER TO tipcards;

--
-- Name: LnurlP; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."LnurlP" (
    "lnbitsId" character varying(36) NOT NULL,
    created timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone,
    finished timestamp with time zone
);


ALTER TABLE public."LnurlP" OWNER TO tipcards;

--
-- Name: LnurlW; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."LnurlW" (
    "lnbitsId" character varying(36) NOT NULL,
    created timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone,
    withdrawn timestamp with time zone,
    "bulkWithdrawId" character varying(64)
);


ALTER TABLE public."LnurlW" OWNER TO tipcards;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."Profile" (
    "user" character varying(64) NOT NULL,
    "accountName" text NOT NULL,
    "displayName" text NOT NULL,
    email text NOT NULL
);


ALTER TABLE public."Profile" OWNER TO tipcards;

--
-- Name: Set; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."Set" (
    id character varying(36) NOT NULL,
    created timestamp with time zone NOT NULL,
    changed timestamp with time zone NOT NULL
);


ALTER TABLE public."Set" OWNER TO tipcards;

--
-- Name: SetSettings; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."SetSettings" (
    set character varying(36) NOT NULL,
    name text NOT NULL,
    "numberOfCards" integer NOT NULL,
    "cardHeadline" text NOT NULL,
    "cardCopytext" text NOT NULL,
    image character varying(36),
    "landingPage" character varying(36) NOT NULL
);


ALTER TABLE public."SetSettings" OWNER TO tipcards;

--
-- Name: User; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."User" (
    id character varying(64) NOT NULL,
    "lnurlAuthKey" character varying(128) NOT NULL,
    created timestamp with time zone NOT NULL,
    permissions json NOT NULL
);


ALTER TABLE public."User" OWNER TO tipcards;

--
-- Name: UserCanUseImage; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."UserCanUseImage" (
    "user" character varying(64) NOT NULL,
    image character varying(36) NOT NULL,
    "canEdit" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserCanUseImage" OWNER TO tipcards;

--
-- Name: UserCanUseLandingPage; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."UserCanUseLandingPage" (
    "user" character varying(64) NOT NULL,
    "landingPage" character varying(36) NOT NULL,
    "canEdit" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserCanUseLandingPage" OWNER TO tipcards;

--
-- Name: UserCanUseSet; Type: TABLE; Schema: public; Owner: tipcards
--

CREATE TABLE public."UserCanUseSet" (
    "user" character varying(64) NOT NULL,
    set character varying(36) NOT NULL,
    "canEdit" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserCanUseSet" OWNER TO tipcards;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: tipcards
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: tipcards
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	325927ee7439e9157e1342b690031eb9e888c1a79f17b036ff2a7b8843eef7de	1718202280036
2	89e11ac9060cfcc13c147f9f64cef84c7fc29f5132cafe86a95cbfecfaadfada	1718202284266
3	5e56ecace22bb0eb6e7fcb6440bd6e521aa2ddde04ef45cd16fa7c25af523cdd	1730217138865
4	25e2d15710028e4f5c1c5791d64bdbc01f9c1a099bdba55d204b9a03d8f20540	1730722597185
5	94cd2966f478326f77b7db63f0fb934905058807f36ead61fda62457a131aa52	1736766861913
6	bd756b63fab2bd2f630dd5fdd84b3e5e53595428c93d195b16c7d7eab8d4fd61	1738054671085
\.


--
-- Data for Name: AllowedSession; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."AllowedSession" ("user", "sessionId") FROM stdin;
\.


--
-- Data for Name: Card; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."Card" (hash, created, set) FROM stdin;
\.


--
-- Data for Name: CardVersion; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."CardVersion" (id, card, created, "lnurlP", "lnurlW", "textForWithdraw", "noteForStatusPage", "sharedFunding", "landingPageViewed") FROM stdin;
\.


--
-- Data for Name: CardVersionHasInvoice; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."CardVersionHasInvoice" ("cardVersion", invoice) FROM stdin;
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."Image" (id, type, name, data) FROM stdin;
bitcoin	svg	Bitcoin Logo	data
lightning	svg	Lightning Logo	data
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."Invoice" (amount, "paymentHash", "paymentRequest", created, paid, "expiresAt", extra, "feeAmount") FROM stdin;
\.


--
-- Data for Name: LandingPage; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."LandingPage" (id, type, name, url) FROM stdin;
default	core	Default	\N
\.


--
-- Data for Name: LnurlP; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."LnurlP" ("lnbitsId", created, "expiresAt", finished) FROM stdin;
\.


--
-- Data for Name: LnurlW; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."LnurlW" ("lnbitsId", created, "expiresAt", withdrawn, "bulkWithdrawId") FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."Profile" ("user", "accountName", "displayName", email) FROM stdin;
\.


--
-- Data for Name: Set; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."Set" (id, created, changed) FROM stdin;
\.


--
-- Data for Name: SetSettings; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."SetSettings" (set, name, "numberOfCards", "cardHeadline", "cardCopytext", image, "landingPage") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."User" (id, "lnurlAuthKey", created, permissions) FROM stdin;
\.


--
-- Data for Name: UserCanUseImage; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."UserCanUseImage" ("user", image, "canEdit") FROM stdin;
\.


--
-- Data for Name: UserCanUseLandingPage; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."UserCanUseLandingPage" ("user", "landingPage", "canEdit") FROM stdin;
\.


--
-- Data for Name: UserCanUseSet; Type: TABLE DATA; Schema: public; Owner: tipcards
--

COPY public."UserCanUseSet" ("user", set, "canEdit") FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: tipcards
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: tipcards
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: AllowedSession AllowedSession_sessionId_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."AllowedSession"
    ADD CONSTRAINT "AllowedSession_sessionId_unique" PRIMARY KEY ("sessionId");


--
-- Name: CardVersionHasInvoice CardVersionHasInvoice_cardVersion_invoice_pk; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersionHasInvoice"
    ADD CONSTRAINT "CardVersionHasInvoice_cardVersion_invoice_pk" PRIMARY KEY ("cardVersion", invoice);


--
-- Name: CardVersion CardVersion_id_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersion"
    ADD CONSTRAINT "CardVersion_id_unique" PRIMARY KEY (id);


--
-- Name: CardVersion CardVersion_lnurlP_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersion"
    ADD CONSTRAINT "CardVersion_lnurlP_unique" UNIQUE ("lnurlP");


--
-- Name: Card Card_hash_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Card"
    ADD CONSTRAINT "Card_hash_unique" PRIMARY KEY (hash);


--
-- Name: Image Image_id_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_id_unique" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_paymentHash_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_paymentHash_unique" PRIMARY KEY ("paymentHash");


--
-- Name: LandingPage LandingPage_id_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."LandingPage"
    ADD CONSTRAINT "LandingPage_id_unique" PRIMARY KEY (id);


--
-- Name: LnurlP LnurlP_lnbitsId_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."LnurlP"
    ADD CONSTRAINT "LnurlP_lnbitsId_unique" PRIMARY KEY ("lnbitsId");


--
-- Name: LnurlW LnurlW_bulkWithdrawId_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."LnurlW"
    ADD CONSTRAINT "LnurlW_bulkWithdrawId_unique" UNIQUE ("bulkWithdrawId");


--
-- Name: LnurlW LnurlW_lnbitsId_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."LnurlW"
    ADD CONSTRAINT "LnurlW_lnbitsId_unique" PRIMARY KEY ("lnbitsId");


--
-- Name: Profile Profile_user_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_user_unique" PRIMARY KEY ("user");


--
-- Name: SetSettings SetSettings_set_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."SetSettings"
    ADD CONSTRAINT "SetSettings_set_unique" PRIMARY KEY (set);


--
-- Name: Set Set_id_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Set"
    ADD CONSTRAINT "Set_id_unique" PRIMARY KEY (id);


--
-- Name: UserCanUseImage UserCanUseImage_user_image_pk; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseImage"
    ADD CONSTRAINT "UserCanUseImage_user_image_pk" PRIMARY KEY ("user", image);


--
-- Name: UserCanUseLandingPage UserCanUseLandingPage_user_landingPage_pk; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseLandingPage"
    ADD CONSTRAINT "UserCanUseLandingPage_user_landingPage_pk" PRIMARY KEY ("user", "landingPage");


--
-- Name: UserCanUseSet UserCanUseSet_user_set_pk; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseSet"
    ADD CONSTRAINT "UserCanUseSet_user_set_pk" PRIMARY KEY ("user", set);


--
-- Name: User User_id_unique; Type: CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_id_unique" PRIMARY KEY (id);


--
-- Name: sessionIdIndex; Type: INDEX; Schema: public; Owner: tipcards
--

CREATE INDEX "sessionIdIndex" ON public."AllowedSession" USING btree ("sessionId");


--
-- Name: AllowedSession AllowedSession_user_User_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."AllowedSession"
    ADD CONSTRAINT "AllowedSession_user_User_id_fk" FOREIGN KEY ("user") REFERENCES public."User"(id);


--
-- Name: CardVersionHasInvoice CardVersionHasInvoice_cardVersion_CardVersion_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersionHasInvoice"
    ADD CONSTRAINT "CardVersionHasInvoice_cardVersion_CardVersion_id_fk" FOREIGN KEY ("cardVersion") REFERENCES public."CardVersion"(id);


--
-- Name: CardVersionHasInvoice CardVersionHasInvoice_invoice_Invoice_paymentHash_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersionHasInvoice"
    ADD CONSTRAINT "CardVersionHasInvoice_invoice_Invoice_paymentHash_fk" FOREIGN KEY (invoice) REFERENCES public."Invoice"("paymentHash");


--
-- Name: CardVersion CardVersion_card_Card_hash_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersion"
    ADD CONSTRAINT "CardVersion_card_Card_hash_fk" FOREIGN KEY (card) REFERENCES public."Card"(hash);


--
-- Name: CardVersion CardVersion_lnurlP_LnurlP_lnbitsId_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersion"
    ADD CONSTRAINT "CardVersion_lnurlP_LnurlP_lnbitsId_fk" FOREIGN KEY ("lnurlP") REFERENCES public."LnurlP"("lnbitsId");


--
-- Name: CardVersion CardVersion_lnurlW_LnurlW_lnbitsId_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."CardVersion"
    ADD CONSTRAINT "CardVersion_lnurlW_LnurlW_lnbitsId_fk" FOREIGN KEY ("lnurlW") REFERENCES public."LnurlW"("lnbitsId");


--
-- Name: Card Card_set_Set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Card"
    ADD CONSTRAINT "Card_set_Set_id_fk" FOREIGN KEY (set) REFERENCES public."Set"(id);


--
-- Name: Profile Profile_user_User_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_user_User_id_fk" FOREIGN KEY ("user") REFERENCES public."User"(id);


--
-- Name: SetSettings SetSettings_image_Image_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."SetSettings"
    ADD CONSTRAINT "SetSettings_image_Image_id_fk" FOREIGN KEY (image) REFERENCES public."Image"(id);


--
-- Name: SetSettings SetSettings_landingPage_LandingPage_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."SetSettings"
    ADD CONSTRAINT "SetSettings_landingPage_LandingPage_id_fk" FOREIGN KEY ("landingPage") REFERENCES public."LandingPage"(id);


--
-- Name: SetSettings SetSettings_set_Set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."SetSettings"
    ADD CONSTRAINT "SetSettings_set_Set_id_fk" FOREIGN KEY (set) REFERENCES public."Set"(id);


--
-- Name: UserCanUseImage UserCanUseImage_image_Image_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseImage"
    ADD CONSTRAINT "UserCanUseImage_image_Image_id_fk" FOREIGN KEY (image) REFERENCES public."Image"(id);


--
-- Name: UserCanUseImage UserCanUseImage_user_User_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseImage"
    ADD CONSTRAINT "UserCanUseImage_user_User_id_fk" FOREIGN KEY ("user") REFERENCES public."User"(id);


--
-- Name: UserCanUseLandingPage UserCanUseLandingPage_landingPage_LandingPage_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseLandingPage"
    ADD CONSTRAINT "UserCanUseLandingPage_landingPage_LandingPage_id_fk" FOREIGN KEY ("landingPage") REFERENCES public."LandingPage"(id);


--
-- Name: UserCanUseLandingPage UserCanUseLandingPage_user_User_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseLandingPage"
    ADD CONSTRAINT "UserCanUseLandingPage_user_User_id_fk" FOREIGN KEY ("user") REFERENCES public."User"(id);


--
-- Name: UserCanUseSet UserCanUseSet_set_Set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseSet"
    ADD CONSTRAINT "UserCanUseSet_set_Set_id_fk" FOREIGN KEY (set) REFERENCES public."Set"(id);


--
-- Name: UserCanUseSet UserCanUseSet_user_User_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tipcards
--

ALTER TABLE ONLY public."UserCanUseSet"
    ADD CONSTRAINT "UserCanUseSet_user_User_id_fk" FOREIGN KEY ("user") REFERENCES public."User"(id);


--
-- Name: DATABASE tipcards; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON DATABASE tipcards TO tipcards;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO tipcards;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

