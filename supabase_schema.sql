create table projects(
 id uuid primary key,
 name text,
 status text,
 created_at timestamp default now()
);
create table tasks(
 id uuid primary key,
 project_id uuid,
 agent text,
 status text
);
