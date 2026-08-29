create table projects(id uuid primary key,name text,status text);
create table messages(id uuid primary key,project_id uuid,role text,content text);
create table agent_tasks(id uuid primary key,project_id uuid,agent text,status text);
