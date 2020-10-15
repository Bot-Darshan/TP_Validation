CREATE TABLE IF NOT EXISTS article (
    id SERIAL NOT NULL,
    users_id INT4 NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL  DEFAULT NOW(),
    CONSTRAINT article_pkey PRIMARY KEY (id),
	CONSTRAINT article_users_id_fkey FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE
);
