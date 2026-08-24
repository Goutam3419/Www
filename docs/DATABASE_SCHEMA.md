# Platform Database Schema (15 Entities)

All tables feature `created_at`, `updated_at`, `created_by`, `updated_by`, and `deleted_at` (soft delete support).

1. `users`: ID, email, name, role (CEO, ADMIN, ENGINEER, VIEWER)
2. `workspaces`: ID, name, slug, description, owner_id
3. `workspace_members`: ID, workspace_id, user_id, role
4. `projects`: ID, workspace_id, name, description, status, framework, language, owner_id, git_repository, environment
5. `project_settings`: ID, project_id, theme, default_ai_model, timezone, permissions
6. `project_chat`: ID, project_id, sender, sender_name, content, tokens_used, model_used
7. `project_memory`: ID, project_id, category, title, content, tags
8. `project_tasks`: ID, project_id, title, description, status, priority, assigned_role
9. `project_logs`: ID, project_id, level, source, message, details
10. `project_connections`: ID, project_id, provider, status, config, last_tested_at
11. `notifications`: ID, user_id, title, message, type, read
12. `activity_logs`: ID, workspace_id, project_id, actor_id, action, target
13. `audit_logs`: ID, actor_id, action, resource, ip_address, user_agent, metadata
14. `user_preferences`: ID, user_id, default_workspace_id, theme, email_notifications
15. `system_settings`: ID, key, value, description
