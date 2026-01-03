# Lynqio Backend Architecture
## Make.com Integration & Pipeline Automation

---

## 🏗️ Architecture Overview

```
User drops LinkedIn URL → Lynqio Platform → Make.com Automation (background)
                              ↑                           ↓
                              |          Apollo API (find decision makers)
                              |          OpenAI API (write messages)  
                              |          HeyReach API (create campaign)
                              |                           ↓
                              ←────────── POST results back ─────────
                              
HeyReach Webhooks → Make.com → POST to Lynqio → Update Pipeline Status
```

---

## 📊 Database Schema (Using kv_store)

### Key Patterns

```typescript
// Runs
run:{runId} → {
  id: string,
  orgId: string,
  userId: string,
  jobUrl: string,
  jobTitle: string,
  company: string,
  status: 'queued' | 'running' | 'completed' | 'failed',
  makeComScenarioId?: string,
  createdAt: string,
  completedAt?: string,
  error?: string
}

// Prospects (Decision Makers)
prospect:{prospectId} → {
  id: string,
  runId: string,
  orgId: string,
  name: string,
  title: string,
  company: string,
  linkedinUrl: string,
  email?: string,
  apolloId?: string,
  rank: 1 | 2 | 3,  // Top 3 decision makers
  createdAt: string
}

// Messages (AI-Generated)
message:{prospectId} → {
  prospectId: string,
  runId: string,
  connectionRequest: string,
  followUp1: string,
  followUp2: string,
  followUp3?: string,
  generatedAt: string
}

// Pipeline Status
pipeline:{prospectId} → {
  prospectId: string,
  runId: string,
  orgId: string,
  stage: 'invite_sent' | 'connected' | 'conversation_started' | 'qualification' | 'proposal_sent' | 'signed_mandate' | 'lost',
  heyReachCampaignId?: string,
  inviteSentAt?: string,
  connectedAt?: string,
  lastActivity?: string,
  notes?: string
}

// Index for queries
org:{orgId}:runs → [runId1, runId2, ...]
org:{orgId}:prospects → [prospectId1, prospectId2, ...]
run:{runId}:prospects → [prospectId1, prospectId2, prospectId3]
```

---

## 🔌 API Endpoints

### 1. Create Run (Frontend → Backend)

```typescript
POST /make-server-0d5eb2a5/runs/create

Headers:
  Authorization: Bearer {publicAnonKey}
  Content-Type: application/json

Request Body:
{
  "orgId": "org_123",
  "userId": "user_456",
  "jobUrl": "https://www.linkedin.com/jobs/view/1234567890",
  "jobTitle": "Senior Full Stack Engineer",
  "company": "Acme Corp"
}

Response:
{
  "runId": "run_abc123",
  "status": "queued",
  "message": "Run created and queued for processing"
}

Backend Actions:
1. Create run record in kv_store
2. Trigger Make.com webhook with run details
3. Return runId to frontend
```

### 2. Receive Decision Makers (Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/runs/{runId}/prospects

Headers:
  Authorization: Bearer {MAKE_COM_API_KEY}
  Content-Type: application/json

Request Body:
{
  "runId": "run_abc123",
  "prospects": [
    {
      "name": "John Smith",
      "title": "VP of Engineering",
      "company": "Acme Corp",
      "linkedinUrl": "https://linkedin.com/in/johnsmith",
      "email": "john.smith@acme.com",
      "apolloId": "apollo_123",
      "rank": 1
    },
    {
      "name": "Sarah Johnson",
      "title": "CTO",
      "company": "Acme Corp",
      "linkedinUrl": "https://linkedin.com/in/sarahjohnson",
      "email": "sarah@acme.com",
      "apolloId": "apollo_456",
      "rank": 2
    },
    {
      "name": "Michael Chen",
      "title": "Head of Product",
      "company": "Acme Corp",
      "linkedinUrl": "https://linkedin.com/in/michaelchen",
      "email": "michael@acme.com",
      "apolloId": "apollo_789",
      "rank": 3
    }
  ]
}

Response:
{
  "success": true,
  "prospectIds": ["prospect_1", "prospect_2", "prospect_3"]
}

Backend Actions:
1. Validate runId exists
2. Create prospect records for each decision maker
3. Update run:{runId}:prospects index
4. Update org:{orgId}:prospects index
5. Return success
```

### 3. Receive AI Messages (Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/runs/{runId}/messages

Headers:
  Authorization: Bearer {MAKE_COM_API_KEY}
  Content-Type: application/json

Request Body:
{
  "runId": "run_abc123",
  "messages": [
    {
      "prospectId": "prospect_1",
      "connectionRequest": "Hi John, I noticed your impressive work at Acme Corp...",
      "followUp1": "Hi John, following up on my connection request...",
      "followUp2": "John, I have 3 exceptional candidates...",
      "followUp3": "Final follow-up..."
    },
    {
      "prospectId": "prospect_2",
      "connectionRequest": "Sarah, your leadership in tech...",
      "followUp1": "Sarah, wanted to circle back...",
      "followUp2": "I have senior engineers perfect for your team..."
    },
    {
      "prospectId": "prospect_3",
      "connectionRequest": "Michael, as Head of Product...",
      "followUp1": "Michael, hope you're doing well...",
      "followUp2": "I'd love to share some product-focused profiles..."
    }
  ]
}

Response:
{
  "success": true,
  "messagesStored": 3
}

Backend Actions:
1. Store message:{prospectId} for each prospect
2. Return success
```

### 4. Receive Campaign Created (Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/runs/{runId}/campaign-created

Headers:
  Authorization: Bearer {MAKE_COM_API_KEY}
  Content-Type: application/json

Request Body:
{
  "runId": "run_abc123",
  "heyReachCampaignId": "heyreach_campaign_xyz",
  "campaigns": [
    {
      "prospectId": "prospect_1",
      "heyReachCampaignId": "heyreach_campaign_xyz",
      "status": "active"
    },
    {
      "prospectId": "prospect_2",
      "heyReachCampaignId": "heyreach_campaign_xyz",
      "status": "active"
    },
    {
      "prospectId": "prospect_3",
      "heyReachCampaignId": "heyreach_campaign_xyz",
      "status": "active"
    }
  ]
}

Response:
{
  "success": true
}

Backend Actions:
1. Update run status to 'completed'
2. Create pipeline:{prospectId} records with stage: 'invite_sent'
3. Store heyReachCampaignId for each prospect
4. Set inviteSentAt timestamp
5. Update run completedAt timestamp
```

### 5. HeyReach Webhook - Invite Accepted (HeyReach → Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/webhooks/heyreach/invite-accepted

Headers:
  Authorization: Bearer {MAKE_COM_API_KEY}
  Content-Type: application/json

Request Body:
{
  "prospectId": "prospect_1",
  "event": "connection_accepted",
  "heyReachCampaignId": "heyreach_campaign_xyz",
  "linkedinUrl": "https://linkedin.com/in/johnsmith",
  "timestamp": "2024-12-25T10:30:00Z"
}

Response:
{
  "success": true,
  "newStage": "connected"
}

Backend Actions:
1. Find prospect by prospectId or linkedinUrl
2. Update pipeline:{prospectId} stage to 'connected'
3. Set connectedAt timestamp
4. Update lastActivity timestamp
5. Trigger next automation step (send first message)
```

### 6. HeyReach Webhook - Message Sent (HeyReach → Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/webhooks/heyreach/message-sent

Request Body:
{
  "prospectId": "prospect_1",
  "event": "message_sent",
  "messageType": "followUp1",
  "timestamp": "2024-12-25T11:00:00Z"
}

Backend Actions:
1. Update pipeline:{prospectId} stage to 'conversation_started'
2. Update lastActivity timestamp
```

### 7. HeyReach Webhook - Message Reply (HeyReach → Make.com → Backend)

```typescript
POST /make-server-0d5eb2a5/webhooks/heyreach/message-reply

Request Body:
{
  "prospectId": "prospect_1",
  "event": "message_reply",
  "replyText": "Thanks for reaching out! I'm interested...",
  "timestamp": "2024-12-25T14:30:00Z"
}

Backend Actions:
1. Update pipeline:{prospectId} stage to 'conversation_started'
2. Create task for user to follow up
3. Send notification to user
4. Update lastActivity timestamp
```

### 8. Manual Pipeline Update (Frontend → Backend)

```typescript
PUT /make-server-0d5eb2a5/prospects/{prospectId}/stage

Headers:
  Authorization: Bearer {publicAnonKey}
  Content-Type: application/json

Request Body:
{
  "stage": "qualification",
  "notes": "Had a call, very interested in senior engineers"
}

Response:
{
  "success": true,
  "prospectId": "prospect_1",
  "newStage": "qualification"
}

Backend Actions:
1. Validate user has access to this prospect
2. Update pipeline:{prospectId} stage
3. Add notes if provided
4. Update lastActivity timestamp
```

### 9. Get Run Details (Frontend → Backend)

```typescript
GET /make-server-0d5eb2a5/runs/{runId}

Headers:
  Authorization: Bearer {publicAnonKey}

Response:
{
  "run": {
    "id": "run_abc123",
    "jobTitle": "Senior Full Stack Engineer",
    "company": "Acme Corp",
    "status": "completed",
    "createdAt": "2024-12-25T09:00:00Z",
    "completedAt": "2024-12-25T09:15:00Z"
  },
  "prospects": [
    {
      "id": "prospect_1",
      "name": "John Smith",
      "title": "VP of Engineering",
      "rank": 1,
      "pipelineStage": "connected",
      "message": {
        "connectionRequest": "Hi John, I noticed your impressive work...",
        "followUp1": "Hi John, following up..."
      }
    },
    {
      "id": "prospect_2",
      "name": "Sarah Johnson",
      "title": "CTO",
      "rank": 2,
      "pipelineStage": "invite_sent",
      "message": {
        "connectionRequest": "Sarah, your leadership in tech..."
      }
    },
    {
      "id": "prospect_3",
      "name": "Michael Chen",
      "title": "Head of Product",
      "rank": 3,
      "pipelineStage": "invite_sent",
      "message": {
        "connectionRequest": "Michael, as Head of Product..."
      }
    }
  ]
}

Backend Actions:
1. Get run:{runId} details
2. Get all prospects from run:{runId}:prospects
3. Get pipeline status for each prospect
4. Get messages for each prospect
5. Return combined data
```

### 10. Get Pipeline (Frontend → Backend)

```typescript
GET /make-server-0d5eb2a5/pipeline?orgId={orgId}&stage={stage}

Headers:
  Authorization: Bearer {publicAnonKey}

Response:
{
  "prospects": [
    {
      "id": "prospect_1",
      "name": "John Smith",
      "title": "VP of Engineering",
      "company": "Acme Corp",
      "stage": "connected",
      "inviteSentAt": "2024-12-25T09:15:00Z",
      "connectedAt": "2024-12-25T10:30:00Z",
      "lastActivity": "2024-12-25T14:30:00Z",
      "runId": "run_abc123"
    },
    // ... more prospects
  ],
  "stageCounts": {
    "invite_sent": 12,
    "connected": 8,
    "conversation_started": 5,
    "qualification": 3,
    "proposal_sent": 2,
    "signed_mandate": 1,
    "lost": 2
  }
}

Backend Actions:
1. Get all prospects from org:{orgId}:prospects
2. Filter by stage if provided
3. Get pipeline status for each
4. Calculate stage counts
5. Return data
```

---

## 🔐 Security

### API Key Authentication

```typescript
// Store in kv_store
apikey:{apiKeyHash} → {
  orgId: string,
  name: string,
  scopes: ['make_com_webhook'],
  createdAt: string,
  lastUsed?: string
}

// Middleware to validate Make.com requests
async function validateMakeComKey(c) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const apiKey = authHeader.split(' ')[1];
  const apiKeyHash = await hashApiKey(apiKey);
  const keyData = await kv.get(`apikey:${apiKeyHash}`);
  
  if (!keyData) {
    return c.json({ error: 'Invalid API key' }, 401);
  }
  
  // Update last used
  await kv.set(`apikey:${apiKeyHash}`, {
    ...keyData,
    lastUsed: new Date().toISOString()
  });
  
  c.set('apiKeyData', keyData);
}
```

---

## 🔄 Make.com Scenario Flow

### Scenario 1: Process New Run

```
Trigger: Webhook from Lynqio
↓
Step 1: Parse LinkedIn Job URL
↓
Step 2: Apollo API - Search for decision makers
  - Search by company name + job title keywords
  - Filter by seniority level (VP, Director, C-level)
  - Get top 3 ranked results
↓
Step 3: POST decision makers to Lynqio
  - POST /runs/{runId}/prospects
↓
Step 4: OpenAI API - Generate personalized messages
  - Prompt: "Write connection request for {name}, {title} at {company} about {jobTitle}"
  - Generate 3-4 follow-up messages with fallback logic
↓
Step 5: POST messages to Lynqio
  - POST /runs/{runId}/messages
↓
Step 6: HeyReach API - Create campaign
  - Create campaign with 3 prospects
  - Add connection request message
  - Add follow-up sequence
  - Set fallback rules (if #1 doesn't respond in 3 days, engage #2)
↓
Step 7: POST campaign details to Lynqio
  - POST /runs/{runId}/campaign-created
```

### Scenario 2: HeyReach Event Listener

```
Trigger: HeyReach Webhook (every event)
↓
Step 1: Parse webhook event
  - connection_accepted
  - message_sent
  - message_reply
  - connection_rejected
↓
Step 2: POST to appropriate Lynqio endpoint
  - /webhooks/heyreach/invite-accepted
  - /webhooks/heyreach/message-sent
  - /webhooks/heyreach/message-reply
```

---

## 📱 Frontend Integration

### Creating a Run

```typescript
// src/app/pages/NewRun.tsx

async function handleCreateRun(jobUrl: string) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/runs/create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: currentOrg.id,
        userId: currentUser.id,
        jobUrl,
        jobTitle: extractedJobTitle,
        company: extractedCompany
      })
    }
  );
  
  const { runId } = await response.json();
  
  // Show success message
  toast.success('Run created! Finding decision makers...');
  
  // Redirect to run detail page
  navigate(`/runs/${runId}`);
  
  // Start polling for updates
  pollRunStatus(runId);
}
```

### Polling for Run Updates

```typescript
async function pollRunStatus(runId: string) {
  const interval = setInterval(async () => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.run.status === 'completed') {
      clearInterval(interval);
      toast.success(`Found ${data.prospects.length} decision makers!`);
      // Update UI with prospects and messages
    } else if (data.run.status === 'failed') {
      clearInterval(interval);
      toast.error('Run failed. Please try again.');
    }
  }, 5000); // Poll every 5 seconds
}
```

### Displaying Run Results

```typescript
// src/app/pages/RunDetail.tsx

function RunDetail() {
  const { runId } = useParams();
  const [run, setRun] = useState(null);
  const [prospects, setProspects] = useState([]);
  
  useEffect(() => {
    loadRunDetails();
  }, [runId]);
  
  async function loadRunDetails() {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    const data = await response.json();
    setRun(data.run);
    setProspects(data.prospects);
  }
  
  return (
    <div>
      <h1>{run?.jobTitle} at {run?.company}</h1>
      
      <div className="prospects-grid">
        {prospects.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            message={prospect.message}
            pipelineStage={prospect.pipelineStage}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

### Testing Make.com Integration Locally

```bash
# 1. Start local Supabase
supabase start

# 2. Use ngrok to expose local backend
ngrok http 54321

# 3. Configure Make.com webhooks to use ngrok URL
https://abc123.ngrok.io/functions/v1/make-server-0d5eb2a5/runs/{runId}/prospects

# 4. Test by creating a run from frontend
```

### Manual Testing with cURL

```bash
# Create a run
curl -X POST https://your-project.supabase.co/functions/v1/make-server-0d5eb2a5/runs/create \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orgId": "org_123",
    "userId": "user_456",
    "jobUrl": "https://linkedin.com/jobs/view/123",
    "jobTitle": "Senior Engineer",
    "company": "Acme Corp"
  }'

# Simulate Make.com sending prospects back
curl -X POST https://your-project.supabase.co/functions/v1/make-server-0d5eb2a5/runs/run_abc123/prospects \
  -H "Authorization: Bearer YOUR_MAKE_COM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "run_abc123",
    "prospects": [
      {
        "name": "John Smith",
        "title": "VP Engineering",
        "company": "Acme Corp",
        "linkedinUrl": "https://linkedin.com/in/johnsmith",
        "rank": 1
      }
    ]
  }'
```

---

## 📝 Summary

### What User Sees:
1. ✅ Paste LinkedIn job URL → Run created
2. ✅ Wait 2-5 minutes (automation running in background)
3. ✅ See 3 decision makers identified
4. ✅ See AI-generated messages for each
5. ✅ See who was reached out to in Pipeline
6. ✅ Automatic pipeline updates when invites accepted
7. ✅ Track conversation progress in CRM

### What Happens Behind the Scenes:
1. ✅ Make.com finds decision makers (Apollo)
2. ✅ Make.com writes personalized messages (OpenAI)
3. ✅ Make.com creates HeyReach campaign
4. ✅ Make.com POSTs all data back to Lynqio
5. ✅ HeyReach webhooks update pipeline automatically
6. ✅ Users maintain full visibility and control
