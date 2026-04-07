--
-- PostgreSQL database dump
--

\restrict KhGoopP4zKCvOYDGeGyq8fzajdkbckuyPDjSPVZhwutJ4CyYSjU785XXhjB8CFr

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(200) NOT NULL,
    nif character varying(20),
    direccion text,
    telefono character varying(30),
    email character varying(255),
    user_id uuid,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.clientes OWNER TO lexdesk_user;

--
-- Name: documentos; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.documentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo character varying(100),
    s3_key character varying(500),
    tamanyo_kb integer,
    procedimiento_id uuid,
    cliente_id uuid,
    user_id uuid,
    ia_metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.documentos OWNER TO lexdesk_user;

--
-- Name: evento_usuarios; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.evento_usuarios (
    evento_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.evento_usuarios OWNER TO lexdesk_user;

--
-- Name: eventos; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo character varying(255) NOT NULL,
    tipo character varying(50),
    fecha date NOT NULL,
    hora time without time zone,
    user_id uuid,
    procedimiento_id uuid,
    google_event_id character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notas text
);


ALTER TABLE public.eventos OWNER TO lexdesk_user;

--
-- Name: facturas; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.facturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero character varying(30) NOT NULL,
    cliente_id uuid,
    concepto text,
    base numeric(12,2),
    iva numeric(12,2),
    total numeric(12,2),
    estado character varying(30) DEFAULT 'Emitida'::character varying,
    fecha date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.facturas OWNER TO lexdesk_user;

--
-- Name: procedimientos; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.procedimientos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero character varying(50) NOT NULL,
    tipo character varying(100),
    juzgado text,
    estado character varying(50) DEFAULT 'En curso'::character varying,
    proxima_act date,
    cliente_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.procedimientos OWNER TO lexdesk_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: lexdesk_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'abogado'::character varying NOT NULL,
    color character varying(20),
    short character varying(5),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    google_tokens jsonb
);


ALTER TABLE public.users OWNER TO lexdesk_user;

--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: documentos documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_pkey PRIMARY KEY (id);


--
-- Name: evento_usuarios evento_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.evento_usuarios
    ADD CONSTRAINT evento_usuarios_pkey PRIMARY KEY (evento_id, user_id);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_numero_key; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_numero_key UNIQUE (numero);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: procedimientos procedimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: documentos documentos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: documentos documentos_procedimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_procedimiento_id_fkey FOREIGN KEY (procedimiento_id) REFERENCES public.procedimientos(id);


--
-- Name: documentos documentos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: evento_usuarios evento_usuarios_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.evento_usuarios
    ADD CONSTRAINT evento_usuarios_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;


--
-- Name: evento_usuarios evento_usuarios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.evento_usuarios
    ADD CONSTRAINT evento_usuarios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: eventos eventos_procedimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_procedimiento_id_fkey FOREIGN KEY (procedimiento_id) REFERENCES public.procedimientos(id);


--
-- Name: eventos eventos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: facturas facturas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: procedimientos procedimientos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lexdesk_user
--

ALTER TABLE ONLY public.procedimientos
    ADD CONSTRAINT procedimientos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KhGoopP4zKCvOYDGeGyq8fzajdkbckuyPDjSPVZhwutJ4CyYSjU785XXhjB8CFr

