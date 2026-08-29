create table projects(
 id uuid primary key,
 name text,
 github_repo text,
 vercel_project text,
 status text,
 created_at timestamp default now()
);

create table agent_tasks(
 id uuid primary key,
 project_id uuid,
 agent text,
 status text,
 output jsonb
);
