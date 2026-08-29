import { db } from '../lib/db/store';

console.log('⚡ Seeding Platform Database schema...');
const workspaces = db.getWorkspaces();
const projects = db.getProjects();

console.log(`✅ Database Seed Complete! Initialized ${workspaces.length} workspace(s) and ${projects.length} project(s).`);
