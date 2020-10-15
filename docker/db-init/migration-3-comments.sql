CREATE TABLE IF NOT EXISTS comment (
    id SERIAL NOT NULL,
    article_id INT4 NOT NULL,
    users_id INT4 NOT NULL,
    content VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT comment_pkey PRIMARY KEY (id),
	CONSTRAINT comment_article_id_fkey FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
	CONSTRAINT comment_users_id_fkey FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE
);
