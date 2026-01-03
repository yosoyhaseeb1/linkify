# Lynqio API Documentation

## Authentication

All API endpoints require two headers:

| Header | Value | Description |
|--------|-------|-------------|
| Authorization | Bearer {SUPABASE_ANON_KEY} | Supabase project access |
| x-clerk-token | {CLERK_JWT} | User authentication & org context |

## Endpoints

### Runs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /runs | List all runs for current org |
| POST | /runs/create | Create new outreach run |
| GET | /runs/:id | Get run details |
| PATCH | /runs/:id | Update run status |
| DELETE | /runs/:id | Delete a run |

### Prospects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /prospects | List all prospects |
| GET | /prospects/:runId | Get prospects for specific run |
| PATCH | /prospects/:id | Update prospect (stage, notes) |

### User Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /user-data/:userId | Get contacts, tasks, jobs |
| PUT | /user-data/:userId/contacts | Save user contacts |
| PUT | /user-data/:userId/tasks | Save user tasks |
| PUT | /user-data/:userId/jobs | Save user jobs |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /org-members/:orgId | List organization members |
| POST | /org-members/:orgId/sync | Sync members from Clerk |
| POST | /org-members/:orgId/add | Add new member |
| DELETE | /org-members/:orgId/:memberId | Remove member |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /messages/:orgId/:channel | Get channel messages |
| POST | /messages/:orgId/:channel | Send message |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/:orgId | Get org analytics |
| GET | /analytics/daily-standup/:orgId | Get standup data |

## Error Codes
| Code | Description |
|------|-------------|
| 401 | Invalid or missing authentication |
| 403 | Not authorized for this resource |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Server error |
