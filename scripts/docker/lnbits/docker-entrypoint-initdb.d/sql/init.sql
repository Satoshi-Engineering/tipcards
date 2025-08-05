--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE lnbits;
ALTER ROLE lnbits WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:8V5dC9SCzQTdzzUFP49bcw==$TJ37QrS6gvUIsSiWRKoVxv191LnS+MG6KpsssKxt6GU=:mEcyYchZSIwiDHwkW+TL55clkiBSNQ04bbZyXxHJTs4=';

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
-- Database "lnbits" dump
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
-- Name: lnbits; Type: DATABASE; Schema: -; Owner: lnbits
--

CREATE DATABASE lnbits WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE lnbits OWNER TO lnbits;

\connect lnbits

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
-- Name: lnurlp; Type: SCHEMA; Schema: -; Owner: lnbits
--

CREATE SCHEMA lnurlp;


ALTER SCHEMA lnurlp OWNER TO lnbits;

--
-- Name: withdraw; Type: SCHEMA; Schema: -; Owner: lnbits
--

CREATE SCHEMA withdraw;


ALTER SCHEMA withdraw OWNER TO lnbits;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pay_links; Type: TABLE; Schema: lnurlp; Owner: lnbits
--

CREATE TABLE lnurlp.pay_links (
    id text NOT NULL,
    wallet text NOT NULL,
    description text NOT NULL,
    min bigint NOT NULL,
    served_meta integer NOT NULL,
    served_pr integer NOT NULL,
    webhook_url text,
    success_text text,
    success_url text,
    currency text,
    comment_chars integer DEFAULT 0,
    max integer,
    fiat_base_multiplier integer DEFAULT 1,
    webhook_headers text,
    webhook_body text,
    username text,
    zaps boolean,
    domain text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE lnurlp.pay_links OWNER TO lnbits;

--
-- Name: pay_links_id_seq; Type: SEQUENCE; Schema: lnurlp; Owner: lnbits
--

CREATE SEQUENCE lnurlp.pay_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE lnurlp.pay_links_id_seq OWNER TO lnbits;

--
-- Name: pay_links_id_seq; Type: SEQUENCE OWNED BY; Schema: lnurlp; Owner: lnbits
--

ALTER SEQUENCE lnurlp.pay_links_id_seq OWNED BY lnurlp.pay_links.id;


--
-- Name: settings; Type: TABLE; Schema: lnurlp; Owner: lnbits
--

CREATE TABLE lnurlp.settings (
    nostr_private_key text NOT NULL
);


ALTER TABLE lnurlp.settings OWNER TO lnbits;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    email text,
    password_hash text,
    username text,
    extra text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    pubkey text,
    access_control_list text,
    external_id text
);


ALTER TABLE public.accounts OWNER TO lnbits;

--
-- Name: apipayments; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.apipayments (
    checking_id text NOT NULL,
    amount bigint NOT NULL,
    fee integer DEFAULT 0 NOT NULL,
    wallet_id text NOT NULL,
    memo text,
    "time" timestamp without time zone DEFAULT now() NOT NULL,
    payment_hash text,
    preimage text,
    bolt11 text,
    extra text,
    webhook text,
    webhook_status text,
    expiry timestamp without time zone,
    status text DEFAULT 'pending'::text,
    tag text,
    extension text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    fiat_provider text
);


ALTER TABLE public.apipayments OWNER TO lnbits;

--
-- Name: audit; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.audit (
    component text,
    ip_address text,
    user_id text,
    path text,
    request_type text,
    request_method text,
    request_details text,
    response_code text,
    duration real NOT NULL,
    delete_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit OWNER TO lnbits;

--
-- Name: balance_check; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.balance_check (
    wallet text NOT NULL,
    service text NOT NULL,
    url text NOT NULL
);


ALTER TABLE public.balance_check OWNER TO lnbits;

--
-- Name: balance_notify; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.balance_notify (
    wallet text NOT NULL,
    url text NOT NULL
);


ALTER TABLE public.balance_notify OWNER TO lnbits;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    name text NOT NULL,
    "user" text NOT NULL,
    adminkey text NOT NULL,
    inkey text,
    currency text,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    extra text
);


ALTER TABLE public.wallets OWNER TO lnbits;

--
-- Name: balances; Type: VIEW; Schema: public; Owner: lnbits
--

CREATE VIEW public.balances AS
 SELECT apipayments.wallet_id,
    sum((apipayments.amount - abs(apipayments.fee))) AS balance
   FROM (public.wallets
     LEFT JOIN public.apipayments ON ((apipayments.wallet_id = wallets.id)))
  WHERE (((wallets.deleted = false) OR (wallets.deleted IS NULL)) AND (((apipayments.status = 'success'::text) AND (apipayments.amount > 0)) OR ((apipayments.status = ANY (ARRAY['success'::text, 'pending'::text])) AND (apipayments.amount < 0))))
  GROUP BY apipayments.wallet_id;


ALTER VIEW public.balances OWNER TO lnbits;

--
-- Name: dbversions; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.dbversions (
    db text NOT NULL,
    version integer NOT NULL
);


ALTER TABLE public.dbversions OWNER TO lnbits;

--
-- Name: extensions; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.extensions (
    "user" text NOT NULL,
    extension text NOT NULL,
    active boolean DEFAULT false,
    extra text
);


ALTER TABLE public.extensions OWNER TO lnbits;

--
-- Name: installed_extensions; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.installed_extensions (
    id text NOT NULL,
    version text NOT NULL,
    name text NOT NULL,
    short_description text,
    icon text,
    stars integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT false,
    meta text DEFAULT '{}'::text NOT NULL
);


ALTER TABLE public.installed_extensions OWNER TO lnbits;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.system_settings (
    id text NOT NULL,
    value text,
    tag text DEFAULT 'core'::text NOT NULL
);


ALTER TABLE public.system_settings OWNER TO lnbits;

--
-- Name: tiny_url; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.tiny_url (
    id text NOT NULL,
    url text,
    endless boolean DEFAULT false NOT NULL,
    wallet text,
    "time" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tiny_url OWNER TO lnbits;

--
-- Name: webpush_subscriptions; Type: TABLE; Schema: public; Owner: lnbits
--

CREATE TABLE public.webpush_subscriptions (
    endpoint text NOT NULL,
    "user" text NOT NULL,
    data text NOT NULL,
    host text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webpush_subscriptions OWNER TO lnbits;

--
-- Name: hash_check; Type: TABLE; Schema: withdraw; Owner: lnbits
--

CREATE TABLE withdraw.hash_check (
    id text NOT NULL,
    lnurl_id text
);


ALTER TABLE withdraw.hash_check OWNER TO lnbits;

--
-- Name: withdraw_link; Type: TABLE; Schema: withdraw; Owner: lnbits
--

CREATE TABLE withdraw.withdraw_link (
    id text NOT NULL,
    wallet text,
    title text,
    min_withdrawable bigint DEFAULT 1,
    max_withdrawable bigint DEFAULT 1,
    uses integer DEFAULT 1,
    wait_time integer,
    is_unique integer DEFAULT 0,
    unique_hash text,
    k1 text,
    open_time integer,
    used integer DEFAULT 0,
    usescsv text,
    webhook_url text,
    custom_url text,
    webhook_headers text,
    webhook_body text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE withdraw.withdraw_link OWNER TO lnbits;

--
-- Name: pay_links id; Type: DEFAULT; Schema: lnurlp; Owner: lnbits
--

ALTER TABLE ONLY lnurlp.pay_links ALTER COLUMN id SET DEFAULT nextval('lnurlp.pay_links_id_seq'::regclass);


--
-- Data for Name: pay_links; Type: TABLE DATA; Schema: lnurlp; Owner: lnbits
--

COPY lnurlp.pay_links (id, wallet, description, min, served_meta, served_pr, webhook_url, success_text, success_url, currency, comment_chars, max, fiat_base_multiplier, webhook_headers, webhook_body, username, zaps, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: lnurlp; Owner: lnbits
--

COPY lnurlp.settings (nostr_private_key) FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.accounts (id, email, password_hash, username, extra, created_at, updated_at, pubkey, access_control_list, external_id) FROM stdin;
7daa1ecbed4741198f05eb7c44a8f8c0	\N	$2b$12$4/0XUrvTj6e1ftTr3JIwUOf6IBlDtKz5Mw3nRRvxc2foY8If1dqNK	superuser	{"email_verified": false, "first_name": null, "last_name": null, "display_name": null, "picture": null, "provider": "lnbits", "visible_wallet_count": 10}	2025-08-05 10:20:13.542773	2025-08-05 10:20:55.961505	\N	\N	\N
79687332617c4a7fa27cb5d61e2603e0	\N	$2b$12$R/b7cq.Wd3RZ5kKHT6w/pey1MVhiB6YCtVFE1o6HerTUNmcpKdboW	develop	{"email_verified": false, "first_name": null, "last_name": null, "display_name": null, "picture": null, "provider": "lnbits", "visible_wallet_count": 10}	2025-08-05 10:21:35.244001	2025-08-05 10:21:56.636442	\N	\N	\N
\.


--
-- Data for Name: apipayments; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.apipayments (checking_id, amount, fee, wallet_id, memo, "time", payment_hash, preimage, bolt11, extra, webhook, webhook_status, expiry, status, tag, extension, created_at, updated_at, fiat_provider) FROM stdin;
71b7f9ac2e25a1d5f2bf58dca9143f91045742fb3e5991f865c479cbefe8ccca	1000000000	0	171199a3d97a43c0b5fe811e32d47012	Admin credit	2025-08-05 10:32:32.372253	71b7f9ac2e25a1d5f2bf58dca9143f91045742fb3e5991f865c479cbefe8ccca	a63afff1475b2b5f8e6f4d95171e3049666b069d268405885f54596d79f2af89	lnbc10m1p5frhwqdq5g9jx66twyp3hyetyd96qxqrrsssp52fcwgqtxr27kkpdxhygmnrl5g79gvs6j3jz5zrx7e2z4uurqy78spp5wxmlntpwyksatu4ltrw2j9pljyz9wshm8ever7r9c3uuhmlgen9qr5ueq6hxfw6htdr0nwmt96et0dtkk4eml0r3vvuruhr2pth2z2w8cel9mjs5wg3e6gvmvxyngwm6ztzhr3jdv6qpw2l8tk30g76g4xqqzwexxn	{"wallet_fiat_currency": "USD", "wallet_fiat_amount": 1150.099, "wallet_fiat_rate": 869.4905357150735, "wallet_btc_rate": 115009.87750000002}	\N	\N	2025-08-05 11:32:32	success	\N	\N	2025-08-05 10:32:32.372255	2025-08-05 10:32:32.372256	\N
1d82424c38e55df3b2488898fe338920aef00afedced314c8514d9bdc65c9cd2	2000000000	0	161dee222082452baef5700de7553b3f	Admin credit	2025-08-05 10:32:36.797282	1d82424c38e55df3b2488898fe338920aef00afedced314c8514d9bdc65c9cd2	43b5a08869bb75d9805afd3d9560633b379d5e5dd5dc8bf4d6b9dc2ca84aa0c6	lnbc20m1p5frhwydq5g9jx66twyp3hyetyd96qxqrrsssp50nyderlkactv2ym77u2vhl7rteap6f9kr2pnn0jlkutp0n2l9fgspp5rkpyynpcu4wl8vjg3zv0uvufyzh0qzh7mnknzny9znvmm3junnfqdw9lqflj0zvwg3jun0z0cgy8ttfd0v4lkutxa6zzpxql58jk7lh9zx6pdwh08a4vhm2rr6t78cvdrke8dssz4n2lkw7qj2nk2f0wrlqpg74fru	{"wallet_fiat_currency": "USD", "wallet_fiat_amount": 2300.198, "wallet_fiat_rate": 869.4905357150735, "wallet_btc_rate": 115009.87750000002}	\N	\N	2025-08-05 11:32:36	success	\N	\N	2025-08-05 10:32:36.797285	2025-08-05 10:32:36.797285	\N
3f0bed262a2b5780576c5dee472353cf37783a32510b585592d611134e4c6aba	3000000000	0	563486e6cac2468b8e69293d1e77832d	Admin credit	2025-08-05 10:32:41.153917	3f0bed262a2b5780576c5dee472353cf37783a32510b585592d611134e4c6aba	79542deeb6d266a70b39f3d1b1286ec73f32aa6a5b87002b5b1667c4e137d2d6	lnbc30m1p5frhwfdq5g9jx66twyp3hyetyd96qxqrrsssp56m6acxzz0u2u3umuzdeawutk996uh69kdtrxq22hznenfyxkmdrqpp58u976f329dtcq4mvthhywg6neumhsw3j2y94s4vj6cg3xnjvd2aqre9f60l3mrdc0r5ykwhl0rtrmq4az3ugs7txcj0r32gep7rw64wzwgh5rjtl2mk23hlwx0409uw22p8hcxme97q7dh0pcv8y7f5qfjspyw3wkh	{"wallet_fiat_currency": "USD", "wallet_fiat_amount": 3450.296, "wallet_fiat_rate": 869.4905357150736, "wallet_btc_rate": 115009.87750000002}	\N	\N	2025-08-05 11:32:41	success	\N	\N	2025-08-05 10:32:41.153924	2025-08-05 10:32:41.153924	\N
\.


--
-- Data for Name: audit; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.audit (component, ip_address, user_id, path, request_type, request_method, request_details, response_code, duration, delete_at, created_at) FROM stdin;
\.


--
-- Data for Name: balance_check; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.balance_check (wallet, service, url) FROM stdin;
\.


--
-- Data for Name: balance_notify; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.balance_notify (wallet, url) FROM stdin;
\.


--
-- Data for Name: dbversions; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.dbversions (db, version) FROM stdin;
core	33
lnurlp	11
withdraw	7
\.


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.extensions ("user", extension, active, extra) FROM stdin;
79687332617c4a7fa27cb5d61e2603e0	lnurlp	t	null
79687332617c4a7fa27cb5d61e2603e0	withdraw	t	null
\.


--
-- Data for Name: installed_extensions; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.installed_extensions (id, version, name, short_description, icon, stars, active, meta) FROM stdin;
lnurlp	1.0.1	Pay Links	Make reusable LNURL pay links	https://github.com/lnbits/lnurlp/raw/main/static/image/lnurl-pay.png	0	t	{"installed_release": {"name": "Pay Links", "version": "1.0.1", "archive": "https://github.com/lnbits/lnurlp/archive/refs/tags/v1.0.1.zip", "source_repo": "https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json", "is_github_release": false, "hash": "281cf5b0ebb4289f93c97ff9438abf18e01569508faaf389723144104bba2273", "min_lnbits_version": "1.0.0", "max_lnbits_version": "1.2.2", "is_version_compatible": true, "html_url": null, "description": "Make reusable LNURL pay links", "warning": null, "repo": "https://github.com/lnbits/lnurlp", "icon": "https://github.com/lnbits/lnurlp/raw/main/static/image/lnurl-pay.png", "details_link": "https://raw.githubusercontent.com/lnbits/lnurlp/main/config.json", "pay_link": null, "cost_sats": null, "paid_sats": 0, "payment_hash": null}, "latest_release": null, "pay_to_enable": null, "payments": [], "dependencies": [], "archive": null, "featured": false}
withdraw	1.0.1	Withdraw Links	Make LNURL withdraw links	https://github.com/lnbits/withdraw/raw/main/static/image/lnurl-withdraw.png	0	t	{"installed_release": {"name": "Withdraw Links", "version": "1.0.1", "archive": "https://github.com/lnbits/withdraw/archive/refs/tags/v1.0.1.zip", "source_repo": "https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json", "is_github_release": false, "hash": "58b3847801efb0dcabd7fa8c9d16c08a2d50cd0e21e96b00b3a0baf88daa9a98", "min_lnbits_version": "1.0.0", "max_lnbits_version": "1.3.0", "is_version_compatible": true, "html_url": null, "description": "Make LNURL withdraw links", "warning": null, "repo": "https://github.com/lnbits/withdraw", "icon": "https://github.com/lnbits/withdraw/raw/main/static/image/lnurl-withdraw.png", "details_link": "https://raw.githubusercontent.com/lnbits/withdraw/main/config.json", "pay_link": null, "cost_sats": null, "paid_sats": 0, "payment_hash": null}, "latest_release": null, "pay_to_enable": null, "payments": [], "dependencies": [], "archive": null, "featured": false}
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.system_settings (id, value, tag) FROM stdin;
super_user	"7daa1ecbed4741198f05eb7c44a8f8c0"	core
keycloak_client_id	""	core
keycloak_client_secret	""	core
keycloak_client_custom_org	\N	core
keycloak_client_custom_icon	\N	core
github_client_id	""	core
github_client_secret	""	core
google_client_id	""	core
google_client_secret	""	core
auth_token_expire_minutes	525600	core
auth_allowed_methods	["user-id-only", "username-password"]	core
auth_credetials_update_threshold	120	core
auth_all_methods	["user-id-only", "username-password", "nostr-auth-nip98", "google-auth", "github-auth", "keycloak-auth"]	core
lnbits_audit_enabled	true	core
lnbits_audit_retention_days	7	core
lnbits_audit_log_ip_address	false	core
lnbits_audit_log_path_params	true	core
lnbits_audit_log_query_params	true	core
lnbits_audit_log_request_body	false	core
lnbits_audit_include_paths	[".*api/v1/.*"]	core
lnbits_audit_exclude_paths	["/static"]	core
lnbits_audit_http_methods	["POST", "PUT", "PATCH", "DELETE"]	core
lnbits_audit_http_response_codes	["4.*", "5.*"]	core
lnbits_node_ui	false	core
lnbits_public_node_ui	false	core
lnbits_node_ui_transactions	false	core
lightning_invoice_expiry	3600	core
stripe_enabled	false	core
stripe_api_endpoint	"https://api.stripe.com"	core
stripe_api_secret_key	\N	core
stripe_payment_success_url	"https://lnbits.com"	core
stripe_payment_webhook_url	"https://your-lnbits-domain-here.com/api/v1/callback/stripe"	core
stripe_webhook_signing_secret	\N	core
strike_api_endpoint	"https://api.strike.me/v1"	core
strike_api_key	\N	core
breez_api_key	\N	core
breez_greenlight_seed	\N	core
breez_greenlight_invite_code	\N	core
breez_greenlight_device_key	\N	core
breez_greenlight_device_cert	\N	core
breez_use_trampoline	true	core
nwc_pairing_url	\N	core
lntips_api_endpoint	\N	core
lntips_api_key	\N	core
lntips_admin_key	\N	core
lntips_invoice_key	\N	core
spark_url	\N	core
spark_token	\N	core
opennode_api_endpoint	\N	core
opennode_key	\N	core
opennode_admin_key	\N	core
opennode_invoice_key	\N	core
phoenixd_api_endpoint	"http://localhost:9740/"	core
phoenixd_api_password	\N	core
zbd_api_endpoint	"https://api.zebedee.io/v0/"	core
zbd_api_key	\N	core
boltz_client_endpoint	"127.0.0.1:9002"	core
boltz_client_macaroon	\N	core
boltz_client_wallet	"lnbits"	core
boltz_client_password	""	core
boltz_client_cert	\N	core
boltz_mnemonic	\N	core
alby_api_endpoint	"https://api.getalby.com/"	core
alby_access_token	\N	core
blink_api_endpoint	"https://api.blink.sv/graphql"	core
blink_ws_endpoint	"wss://ws.blink.sv/graphql"	core
blink_token	\N	core
lnpay_api_endpoint	\N	core
lnpay_api_key	\N	core
lnpay_wallet_key	\N	core
lnpay_admin_key	\N	core
lnd_grpc_endpoint	\N	core
lnd_grpc_cert	\N	core
lnd_grpc_port	\N	core
lnd_grpc_admin_macaroon	\N	core
lnd_grpc_invoice_macaroon	\N	core
lnd_grpc_macaroon	\N	core
lnd_grpc_macaroon_encrypted	\N	core
lnd_rest_endpoint	\N	core
lnd_rest_cert	\N	core
lnd_rest_macaroon	\N	core
lnd_rest_macaroon_encrypted	\N	core
lnd_rest_route_hints	true	core
lnd_rest_allow_self_payment	false	core
lnd_cert	\N	core
lnd_admin_macaroon	\N	core
lnd_invoice_macaroon	\N	core
lnd_rest_admin_macaroon	\N	core
lnd_rest_invoice_macaroon	\N	core
eclair_url	\N	core
eclair_pass	\N	core
corelightning_rest_url	\N	core
corelightning_rest_macaroon	\N	core
corelightning_rest_cert	\N	core
corelightning_rpc	\N	core
corelightning_pay_command	"pay"	core
clightning_rpc	\N	core
cliche_endpoint	\N	core
lnbits_endpoint	"https://demo.lnbits.com"	core
lnbits_key	\N	core
lnbits_admin_key	\N	core
lnbits_invoice_key	\N	core
fake_wallet_secret	"ToTheMoon1"	core
lnbits_denomination	"sats"	core
lnbits_backend_wallet_class	"FakeWallet"	core
lnbits_funding_source_pay_invoice_wait_seconds	5	core
lnbits_nostr_notifications_enabled	false	core
lnbits_nostr_notifications_private_key	""	core
lnbits_nostr_notifications_identifiers	[]	core
lnbits_telegram_notifications_enabled	false	core
lnbits_telegram_notifications_access_token	""	core
lnbits_telegram_notifications_chat_id	""	core
lnbits_email_notifications_enabled	false	core
lnbits_email_notifications_email	""	core
lnbits_email_notifications_username	""	core
lnbits_email_notifications_password	""	core
keycloak_discovery_url	""	core
nostr_absolute_request_urls	["http://127.0.0.1:4020", "http://localhost:4020"]	core
lnbits_webpush_pubkey	"BMpxaLHzOsrHnow3gIJYTk3xae4H8obo3sgaOVMEh2zGSGkKio_mRhf1Z6O8uhhn_62zYU0La6zEPgV-Pq7HmJU"	core
lnbits_webpush_privkey	"-----BEGIN PRIVATE KEY-----\\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgr+rwxbvVdQu61j/n\\nibcofMwL5nrpfWqhZ9kw8kgEnLuhRANCAATKcWix8zrKx56MN4CCWE5N8WnuB/KG\\n6N7IGjlTBIdsxkhpCoqP5kYX9WejvLoYZ/+ts2FNC2usxD4Ffj6ux5iV\\n-----END PRIVATE KEY-----\\n"	core
stripe_limits	{"allowed_users": [], "service_max_fee_sats": 0, "service_fee_percent": 0.0, "service_fee_wallet_id": null, "service_min_amount_sats": 0, "service_max_amount_sats": 0, "service_faucet_wallet_id": ""}	core
lnbits_email_notifications_server	"smtp.protonmail.ch"	core
lnbits_email_notifications_port	587	core
lnbits_email_notifications_to_emails	[]	core
lnbits_notification_settings_update	true	core
lnbits_notification_credit_debit	true	core
notification_balance_delta_changed	true	core
lnbits_notification_server_start_stop	true	core
lnbits_notification_watchdog	false	core
lnbits_notification_server_status_hours	24	core
lnbits_notification_incoming_payment_amount_sats	1000000	core
lnbits_notification_outgoing_payment_amount_sats	1000000	core
lnbits_rate_limit_no	200	core
lnbits_rate_limit_unit	"minute"	core
lnbits_allowed_ips	[]	core
lnbits_blocked_ips	[]	core
lnbits_callback_url_rules	["https?://([a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,})(:\\\\d+)?"]	core
lnbits_wallet_limit_max_balance	0	core
lnbits_wallet_limit_daily_max_withdraw	0	core
lnbits_wallet_limit_secs_between_trans	0	core
lnbits_only_allow_incoming_payments	false	core
lnbits_watchdog_switch_to_voidwallet	false	core
lnbits_watchdog_interval_minutes	60	core
lnbits_watchdog_delta	1000000	core
lnbits_max_outgoing_payment_amount_sats	10000000	core
lnbits_max_incoming_payment_amount_sats	10000000	core
lnbits_exchange_rate_cache_seconds	30	core
lnbits_exchange_history_size	60	core
lnbits_exchange_history_refresh_interval_seconds	300	core
lnbits_reserve_fee_min	2000	core
lnbits_reserve_fee_percent	1.0	core
lnbits_service_fee	0.0	core
lnbits_service_fee_ignore_internal	true	core
lnbits_service_fee_max	0	core
lnbits_service_fee_wallet	\N	core
lnbits_baseurl	"http://127.0.0.1:4020/"	core
lnbits_hide_api	false	core
lnbits_upload_size_bytes	512000	core
lnbits_upload_allowed_types	["image/png", "image/jpeg", "image/jpg", "image/heic", "image/heif", "image/heics", "png", "jpeg", "jpg", "heic", "heif", "heics"]	core
lnbits_site_title	"LNbits"	core
lnbits_site_tagline	"free and open-source lightning wallet"	core
lnbits_site_description	"The world's most powerful suite of bitcoin tools."	core
lnbits_show_home_page_elements	true	core
lnbits_default_wallet_name	"LNbits wallet"	core
lnbits_custom_badge	\N	core
lnbits_custom_badge_color	"warning"	core
lnbits_theme_options	["classic", "freedom", "mint", "salvador", "monochrome", "autumn", "cyber", "flamingo", "bitcoin"]	core
lnbits_custom_logo	\N	core
lnbits_custom_image	"/static/images/logos/lnbits.svg"	core
lnbits_ad_space_title	"Supported by"	core
lnbits_ad_space	"https://shop.lnbits.com/;/static/images/bitcoin-shop-banner.png;/static/images/bitcoin-shop-banner.png,https://affil.trezor.io/aff_c?offer_id=169&aff_id=33845;/static/images/bitcoin-hardware-wallet.png;/static/images/bitcoin-hardware-wallet.png,https://opensats.org/;/static/images/open-sats.png;/static/images/open-sats.png"	core
lnbits_ad_space_enabled	false	core
lnbits_allowed_currencies	[]	core
lnbits_default_accounting_currency	\N	core
lnbits_qr_logo	"/static/images/favicon_qr_logo.png"	core
lnbits_default_reaction	"confettiBothSides"	core
lnbits_default_theme	"salvador"	core
lnbits_default_border	"hard-border"	core
lnbits_default_gradient	true	core
lnbits_default_bgimage	\N	core
lnbits_admin_extensions	[]	core
lnbits_user_default_extensions	[]	core
lnbits_extensions_deactivate_all	false	core
lnbits_extensions_manifests	["https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json"]	core
lnbits_admin_users	[]	core
lnbits_allowed_users	[]	core
lnbits_allow_new_accounts	true	core
lnbits_exchange_rate_providers	[{"name": "Binance", "api_url": "https://api.binance.com/api/v3/ticker/price?symbol=BTC{TO}", "path": "$.price", "exclude_to": ["czk"], "ticker_conversion": ["USD:USDT"]}, {"name": "Blockchain", "api_url": "https://blockchain.info/frombtc?currency={TO}&value=100000000", "path": "", "exclude_to": [], "ticker_conversion": []}, {"name": "Exir", "api_url": "https://api.exir.io/v1/ticker?symbol=btc-{to}", "path": "$.last", "exclude_to": ["czk", "eur"], "ticker_conversion": ["USD:USDT"]}, {"name": "Bitfinex", "api_url": "https://api.bitfinex.com/v1/pubticker/btc{to}", "path": "$.last_price", "exclude_to": ["czk"], "ticker_conversion": []}, {"name": "Bitstamp", "api_url": "https://www.bitstamp.net/api/v2/ticker/btc{to}/", "path": "$.last", "exclude_to": ["czk"], "ticker_conversion": []}, {"name": "Coinbase", "api_url": "https://api.coinbase.com/v2/exchange-rates?currency=BTC", "path": "$.data.rates.{TO}", "exclude_to": [], "ticker_conversion": []}, {"name": "Kraken", "api_url": "https://api.kraken.com/0/public/Ticker?pair=XBT{TO}", "path": "$.result.XXBTZ{TO}.c[0]", "exclude_to": ["czk"], "ticker_conversion": []}, {"name": "yadio", "api_url": "https://api.yadio.io/exrates/BTC", "path": "$.BTC.{TO}", "exclude_to": [], "ticker_conversion": []}]	core
\.


--
-- Data for Name: tiny_url; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.tiny_url (id, url, endless, wallet, "time") FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.wallets (id, name, "user", adminkey, inkey, currency, deleted, created_at, updated_at, extra) FROM stdin;
cf5830a4ca104772ae659467842c0a4f	LNbits wallet	7daa1ecbed4741198f05eb7c44a8f8c0	9875485db2954b26acc6b027618e7592	9991b4a2222046f98bf2194605e13fa8	USD	f	2025-08-05 10:20:13.543589	2025-08-05 10:20:13.54359	{"icon": "flash_on", "color": "primary", "pinned": false}
171199a3d97a43c0b5fe811e32d47012	develop	79687332617c4a7fa27cb5d61e2603e0	8d4e4a151ae5446586ab283e4a89d98c	f95447ee6414419b8ff3e415a4e359f8	USD	f	2025-08-05 10:21:35.248214	2025-08-05 10:21:35.248222	{"icon": "flash_on", "color": "primary", "pinned": false}
161dee222082452baef5700de7553b3f	Wallet2	79687332617c4a7fa27cb5d61e2603e0	6da0c95636c44058bf1d09933476ac26	c2b6f2dcbdc944d3b4b932783d28a6db	USD	f	2025-08-05 10:22:44.960417	2025-08-05 10:22:44.960423	{"icon": "flash_on", "color": "primary", "pinned": false}
563486e6cac2468b8e69293d1e77832d	Wallet3	79687332617c4a7fa27cb5d61e2603e0	29f376ee8bec4503b241eb912666c397	ea059680d75b4b86aa2f9d0facf0edf5	USD	f	2025-08-05 10:23:05.876348	2025-08-05 10:23:05.876355	{"icon": "flash_on", "color": "primary", "pinned": false}
\.


--
-- Data for Name: webpush_subscriptions; Type: TABLE DATA; Schema: public; Owner: lnbits
--

COPY public.webpush_subscriptions (endpoint, "user", data, host, "timestamp") FROM stdin;
\.


--
-- Data for Name: hash_check; Type: TABLE DATA; Schema: withdraw; Owner: lnbits
--

COPY withdraw.hash_check (id, lnurl_id) FROM stdin;
\.


--
-- Data for Name: withdraw_link; Type: TABLE DATA; Schema: withdraw; Owner: lnbits
--

COPY withdraw.withdraw_link (id, wallet, title, min_withdrawable, max_withdrawable, uses, wait_time, is_unique, unique_hash, k1, open_time, used, usescsv, webhook_url, custom_url, webhook_headers, webhook_body, created_at) FROM stdin;
\.


--
-- Name: pay_links_id_seq; Type: SEQUENCE SET; Schema: lnurlp; Owner: lnbits
--

SELECT pg_catalog.setval('lnurlp.pay_links_id_seq', 1, false);


--
-- Name: pay_links pay_links_pkey; Type: CONSTRAINT; Schema: lnurlp; Owner: lnbits
--

ALTER TABLE ONLY lnurlp.pay_links
    ADD CONSTRAINT pay_links_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: apipayments apipayments_wallet_payhash_key; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.apipayments
    ADD CONSTRAINT apipayments_wallet_payhash_key UNIQUE (wallet_id, checking_id);


--
-- Name: balance_check balance_check_wallet_service_key; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.balance_check
    ADD CONSTRAINT balance_check_wallet_service_key UNIQUE (wallet, service);


--
-- Name: balance_notify balance_notify_wallet_url_key; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.balance_notify
    ADD CONSTRAINT balance_notify_wallet_url_key UNIQUE (wallet, url);


--
-- Name: dbversions dbversions_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.dbversions
    ADD CONSTRAINT dbversions_pkey PRIMARY KEY (db);


--
-- Name: extensions extensions_user_extension_key; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.extensions
    ADD CONSTRAINT extensions_user_extension_key UNIQUE ("user", extension);


--
-- Name: installed_extensions installed_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.installed_extensions
    ADD CONSTRAINT installed_extensions_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_id_tag_key; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_id_tag_key UNIQUE (id, tag);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: tiny_url tiny_url_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.tiny_url
    ADD CONSTRAINT tiny_url_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: webpush_subscriptions webpush_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.webpush_subscriptions
    ADD CONSTRAINT webpush_subscriptions_pkey PRIMARY KEY (endpoint, "user");


--
-- Name: hash_check hash_check_pkey; Type: CONSTRAINT; Schema: withdraw; Owner: lnbits
--

ALTER TABLE ONLY withdraw.hash_check
    ADD CONSTRAINT hash_check_pkey PRIMARY KEY (id);


--
-- Name: withdraw_link withdraw_link_pkey; Type: CONSTRAINT; Schema: withdraw; Owner: lnbits
--

ALTER TABLE ONLY withdraw.withdraw_link
    ADD CONSTRAINT withdraw_link_pkey PRIMARY KEY (id);


--
-- Name: withdraw_link withdraw_link_unique_hash_key; Type: CONSTRAINT; Schema: withdraw; Owner: lnbits
--

ALTER TABLE ONLY withdraw.withdraw_link
    ADD CONSTRAINT withdraw_link_unique_hash_key UNIQUE (unique_hash);


--
-- Name: by_hash; Type: INDEX; Schema: public; Owner: lnbits
--

CREATE INDEX by_hash ON public.apipayments USING btree (payment_hash);


--
-- Name: balance_check balance_check_wallet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.balance_check
    ADD CONSTRAINT balance_check_wallet_fkey FOREIGN KEY (wallet) REFERENCES public.wallets(id);


--
-- Name: balance_notify balance_notify_wallet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lnbits
--

ALTER TABLE ONLY public.balance_notify
    ADD CONSTRAINT balance_notify_wallet_fkey FOREIGN KEY (wallet) REFERENCES public.wallets(id);


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
-- PostgreSQL database cluster dump complete
--

