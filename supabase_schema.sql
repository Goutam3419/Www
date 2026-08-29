create table projects (
 id uuid primary key,
 user_id uuid,
 name text,
 status text,
 github_repo text,
 vercel_project text,
 created_at timestamp default now()
);
create table messages (
 id uuid primary key,
 project_id uuid,
 role text,
 content text
);
create table tasks (
 id uuid primary key,
 project_id uuid,
 agent text,
 status text
);
