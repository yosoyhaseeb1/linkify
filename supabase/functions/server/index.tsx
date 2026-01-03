console.log('[INIT] Starting imports...');
console.log('[🚀 DEPLOYMENT] Build: 2024-12-28-v2.0.0 | Timestamp:', Date.now());

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js';
import { jwtVerify, createRemoteJWKSet } from 'npm:jose';

console.log('[INIT] Core imports successful');

import messagesRoutes from './messages.tsx';

console.log('[INIT] Messages routes imported successfully');
console.log('[INIT] Starting server initialization...');

const app = new Hono();

// Clerk JWKS for JWT verification
const CLERK_JWKS_URL = 'https://deciding-viper-67.clerk.accounts.dev/.well-known/jwks.json';
console.log('[INIT] Creating JWKS with URL:', CLERK_JWKS_URL);
const JWKS = createRemoteJWKSet(new URL(CLERK_JWKS_URL));
console.log('[INIT] JWKS created successfully');

// Supabase client with service role for backend operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://wodhmhxyzfqyygtpeyrc.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log('[INIT] Supabase URL:', supabaseUrl);
console.log('[INIT] Service key present:', !!supabaseServiceKey);

if (!supabaseServiceKey) {
  console.error('[INIT] WARNING: SUPABASE_SERVICE_ROLE_KEY is empty!');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('[INIT] Supabase client created successfully');

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-clerk-token'],
}));

// Auth context interface
interface AuthContext {
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  email: string | null;
}

// JWT verification middleware
async function verifyClerkToken(c: any, next: any) {
  try {
    const path = c.req.path;
    
    console.log(`[AUTH] Checking path: ${path}`);
    
    // Skip auth for health check and webhooks
    if (path === '/make-server-0d5eb2a5/health' || path === '/' || c.req.method === 'OPTIONS' || path.includes('/webhooks/')) {
      console.log(`[AUTH] Skipping auth for: ${path}`);
      return next();
    }

    const clerkToken = c.req.header('x-clerk-token');
    
    if (!clerkToken) {
      console.error(`[AUTH] Missing x-clerk-token for path: ${path}`);
      return c.json({ code: 401, message: 'Missing x-clerk-token header' }, 401);
    }

    const { payload } = await jwtVerify(clerkToken, JWKS, {
      issuer: 'https://deciding-viper-67.clerk.accounts.dev',
    });

    const authContext: AuthContext = {
      userId: payload.sub as string,
      orgId: payload.org_id as string | null,
      orgRole: payload.org_role as string | null,
      email: payload.email as string | null,
    };

    c.set('auth', authContext);
    console.log(`[AUTH] ✅ Verified user: ${authContext.userId}, org: ${authContext.orgId}, payload keys: ${Object.keys(payload).join(', ')}`);
    return next();
  } catch (error) {
    console.error('[AUTH] Middleware error:', error);
    return c.json({ code: 500, message: 'Internal server error in auth middleware' }, 500);
  }
}

app.use('*', verifyClerkToken);

// Helper to require org context
function requireOrg(c: any): AuthContext & { orgId: string } {
  const auth = c.get('auth') as AuthContext;
  if (!auth?.orgId) {
    throw new Error('Organization context required');
  }
  return auth as AuthContext & { orgId: string };
}

// Helper to get auth (may not have org)
function getAuth(c: any): AuthContext {
  return c.get('auth') as AuthContext;
}

// Helper to require admin role
function requireAdmin(c: any): AuthContext & { orgId: string } {
  const auth = requireOrg(c);
  if (auth.orgRole !== 'org:admin' && auth.orgRole !== 'admin') {
    throw new Error('Admin access required');
  }
  return auth;
}

// Middleware to validate Make.com API key for webhook endpoints
async function validateMakeComKey(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing Bearer token' }, 401);
  }
  
  const apiKey = authHeader.split(' ')[1];
  
  // Check if API key exists in database
  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();
  
  if (error || !apiKeyData) {
    console.log('Invalid Make.com API key attempt');
    return c.json({ error: 'Unauthorized - Invalid API key' }, 401);
  }
  
  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key', apiKey);
  
  c.set('apiKeyData', apiKeyData);
  await next();
}

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Health check endpoint
app.get("/make-server-0d5eb2a5/health", (c) => {
  return c.json({ status: "ok", version: "2.0.1", timestamp: Date.now() });
});

// Version check endpoint
app.get("/make-server-0d5eb2a5/version", (c) => {
  return c.json({ 
    version: "2.0.0",
    build: "2024-12-28",
    status: "healthy"
  });
});

// ============================================
// RUNS ENDPOINTS
// ============================================

// Create a new run (Frontend → Backend) - SECURED
app.post("/make-server-0d5eb2a5/runs/create", async (c) => {
  try {
    const auth = requireOrg(c);
    const body = await c.req.json();
    const { jobUrl, jobTitle, company } = body;

    if (!jobUrl) {
      return c.json({ error: 'Missing required field: jobUrl' }, 400);
    }

    // Check usage limit
    const { data: currentUsage } = await supabase
      .from('usage')
      .select('runs_used')
      .eq('organization_id', auth.orgId)
      .single();
    
    const { data: limits } = await supabase
      .from('plan_limits')
      .select('runs_limit')
      .eq('plan_name', 'pilot')
      .single();
    
    const runsUsed = currentUsage?.runs_used || 0;
    const runsLimit = limits?.runs_limit || 10;
    
    if (runsLimit !== -1 && runsUsed >= runsLimit) {
      return c.json({
        error: 'usage_limit_exceeded',
        message: `You've reached your monthly limit of ${runsLimit} runs`,
        current: runsUsed,
        limit: runsLimit
      }, 403);
    }

    // Check warmup limit
    const { data: warmup } = await supabase
      .from('warmup_status')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    if (warmup && !warmup.completed) {
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if new day
      if (warmup.last_reset_date !== today) {
        await supabase
          .from('warmup_status')
          .update({
            daily_runs_created: 0,
            daily_invites_sent: 0,
            last_reset_date: today
          })
          .eq('organization_id', auth.orgId);
        warmup.daily_runs_created = 0;
      }

      const startDate = new Date(warmup.start_date);
      const now = new Date();
      const daysSinceStart = Math.ceil(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get limits for current day
      let maxRuns = 1;
      if (daysSinceStart <= 2) maxRuns = 1;
      else if (daysSinceStart <= 4) maxRuns = 1;
      else if (daysSinceStart <= 7) maxRuns = 2;
      else if (daysSinceStart <= 10) maxRuns = 3;
      else if (daysSinceStart <= 14) maxRuns = 4;
      else maxRuns = -1; // Warmup complete

      if (maxRuns !== -1 && warmup.daily_runs_created >= maxRuns) {
        return c.json({
          error: 'warmup_limit',
          message: `🔥 Warmup day ${daysSinceStart}/14: You've used all ${maxRuns} runs for today. This protects your LinkedIn account!`,
          current: warmup.daily_runs_created,
          limit: maxRuns,
          daysSinceStart,
          daysRemaining: 14 - daysSinceStart,
          tomorrowLimit: daysSinceStart < 14 ? (daysSinceStart < 4 ? 1 : daysSinceStart < 7 ? 2 : daysSinceStart < 10 ? 3 : 4) : 'unlimited'
        }, 403);
      }
    }

    // Check if job URL is claimed by someone else
    const { data: existingClaim } = await supabase
      .from('job_claims')
      .select('*, member:members!job_claims_user_id_fkey(name)')
      .eq('organization_id', auth.orgId)
      .eq('job_url', jobUrl)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingClaim && existingClaim.user_id !== auth.userId) {
      return c.json({
        error: 'job_claimed_by_other',
        message: 'This job is currently claimed by another team member',
        claimedBy: existingClaim.member?.name || 'Unknown',
        claimedAt: existingClaim.claimed_at
      }, 409);
    }

    // Check company blacklist
    const { data: blacklist } = await supabase
      .from('blacklist')
      .select('*')
      .eq('organization_id', auth.orgId);

    const normalizedJobUrl = jobUrl.toLowerCase();
    const matchedEntry = blacklist?.find((entry: any) => {
      if (company && entry.company) {
        return company.toLowerCase().includes(entry.company.toLowerCase()) ||
               entry.company.toLowerCase().includes(company.toLowerCase());
      }
      if (entry.domain) {
        return normalizedJobUrl.includes(entry.domain.toLowerCase());
      }
      return false;
    });

    if (matchedEntry) {
      return c.json({
        error: 'company_blacklisted',
        message: 'This company is on your organization\'s blacklist',
        reason: matchedEntry.reason || 'No reason provided',
        blacklistedCompany: matchedEntry.company || matchedEntry.domain
      }, 403);
    }

    // Check for duplicate job URL
    const { data: duplicateRun } = await supabase
      .from('runs')
      .select('id, created_by, created_at, status, member:members!runs_created_by_fkey(name)')
      .eq('organization_id', auth.orgId)
      .eq('search_url', jobUrl)
      .single();

    if (duplicateRun) {
      return c.json({
        error: 'duplicate_job_url',
        message: 'This job URL has already been run by a team member',
        existingRun: {
          id: duplicateRun.id,
          userId: duplicateRun.created_by,
          userName: duplicateRun.member?.name || 'Unknown',
          createdAt: duplicateRun.created_at,
          status: duplicateRun.status
        }
      }, 409);
    }

    // Get user name
    const { data: member } = await supabase
      .from('members')
      .select('name')
      .eq('organization_id', auth.orgId)
      .eq('id', auth.userId)
      .single();

    // Create run
    const { data: run, error } = await supabase
      .from('runs')
      .insert({
        organization_id: auth.orgId,
        created_by: auth.userId,
        name: jobTitle || 'Untitled Position',
        search_url: jobUrl,
        status: 'queued',
        settings: { company }
      })
      .select()
      .single();

    if (error) throw error;

    // Remove claim if exists
    if (existingClaim) {
      await supabase
        .from('job_claims')
        .delete()
        .eq('id', existingClaim.id);
    }

    console.log(`✅ Run created: ${run.id} for org: ${auth.orgId} by user: ${member?.name || 'Unknown'}`);

    // Increment usage
    await supabase.from('usage').upsert({
      organization_id: auth.orgId,
      runs_used: runsUsed + 1,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' });

    // Increment warmup counter
    if (warmup && !warmup.completed) {
      await supabase
        .from('warmup_status')
        .update({
          daily_runs_created: (warmup.daily_runs_created || 0) + 1,
          total_runs_created: (warmup.total_runs_created || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', auth.orgId);
    }

    return c.json({
      runId: run.id,
      status: 'queued',
      message: 'Run created and queued for processing'
    });
  } catch (error) {
    console.error('Error creating run:', error);
    return c.json({ error: 'Failed to create run' }, 500);
  }
});

// Get run details (Frontend → Backend) - SECURED
app.get("/make-server-0d5eb2a5/runs/:runId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { runId } = c.req.param();

    // Get run with prospects and messages
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select(`
        *,
        prospects (
          *,
          messages (*)
        )
      `)
      .eq('id', runId)
      .eq('organization_id', auth.orgId)
      .single();

    if (runError || !run) {
      return c.json({ error: 'Run not found' }, 404);
    }

    // Sort prospects by rank
    const prospects = (run.prospects || []).sort((a: any, b: any) => (a.rank || 0) - (b.rank || 0));

    return c.json({
      run: {
        id: run.id,
        orgId: run.organization_id,
        userId: run.created_by,
        jobUrl: run.search_url,
        jobTitle: run.name,
        company: run.settings?.company,
        status: run.status,
        createdAt: run.created_at
      },
      prospects: prospects.map((p: any) => ({
        ...p,
        message: p.messages?.[0] || null,
        pipelineStage: p.stage || 'not_started'
      }))
    });
  } catch (error) {
    console.error('Error getting run details:', error);
    return c.json({ error: 'Failed to get run details' }, 500);
  }
});

// Get all runs for the user's org (Frontend → Backend) - SECURED
app.get("/make-server-0d5eb2a5/runs", async (c) => {
  try {
    const auth = requireOrg(c);

    const { data: runs, error } = await supabase
      .from('runs')
      .select('*, prospects(count)')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({
      runs: (runs || []).map((run: any) => ({
        id: run.id,
        orgId: run.organization_id,
        userId: run.created_by,
        jobUrl: run.search_url,
        jobTitle: run.name,
        company: run.settings?.company,
        status: run.status,
        createdAt: run.created_at,
        prospectCount: run.prospects?.[0]?.count || 0
      }))
    });
  } catch (error) {
    console.error('Error getting runs:', error);
    return c.json({ error: 'Failed to get runs' }, 500);
  }
});

// Alternative endpoint for org runs - SECURED
app.get("/make-server-0d5eb2a5/org-runs/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { data: runs, error } = await supabase
      .from('runs')
      .select('*, prospects(count)')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({
      runs: (runs || []).map((run: any) => ({
        id: run.id,
        orgId: run.organization_id,
        userId: run.created_by,
        jobUrl: run.search_url,
        jobTitle: run.name,
        company: run.settings?.company,
        status: run.status,
        createdAt: run.created_at,
        prospectCount: run.prospects?.[0]?.count || 0
      }))
    });
  } catch (error) {
    console.error('Error getting runs:', error);
    return c.json({ error: 'Failed to get runs' }, 500);
  }
});

// ============================================
// MAKE.COM WEBHOOK ENDPOINTS
// ============================================

// Receive decision makers from Make.com
app.post("/make-server-0d5eb2a5/runs/:runId/prospects", validateMakeComKey, async (c) => {
  try {
    const { runId } = c.req.param();
    const body = await c.req.json();
    const { prospects } = body;

    // Get run
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return c.json({ error: 'Run not found' }, 404);
    }

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return c.json({ error: 'Invalid prospects array' }, 400);
    }

    // Create prospect records
    const prospectsToInsert = prospects.map((p: any) => ({
      run_id: runId,
      organization_id: run.organization_id,
      name: p.name,
      title: p.title,
      company: p.company,
      linkedin_url: p.linkedinUrl,
      email: p.email || null,
      metadata: { apollo_id: p.apolloId, rank: p.rank, ...p },
      stage: 'not_started'
    }));

    const { data: insertedProspects, error: insertError } = await supabase
      .from('prospects')
      .insert(prospectsToInsert)
      .select();

    if (insertError) throw insertError;

    // Update run status
    await supabase
      .from('runs')
      .update({ status: 'running' })
      .eq('id', runId);

    console.log(`Stored ${insertedProspects.length} prospects for run ${runId}`);

    return c.json({
      success: true,
      prospectIds: insertedProspects.map(p => p.id)
    });
  } catch (error) {
    console.error('Error storing prospects:', error);
    return c.json({ error: 'Failed to store prospects' }, 500);
  }
});

// Receive AI-generated messages from Make.com
app.post("/make-server-0d5eb2a5/runs/:runId/messages", validateMakeComKey, async (c) => {
  try {
    const { runId } = c.req.param();
    const body = await c.req.json();
    const { messages } = body;

    // Verify run exists
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return c.json({ error: 'Run not found' }, 404);
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'Invalid messages array' }, 400);
    }

    // Store messages for each prospect
    const messagesToInsert = messages.map((m: any) => ({
      prospect_id: m.prospectId,
      run_id: runId,
      organization_id: run.organization_id,
      sender_id: run.created_by,
      direction: 'outbound',
      channel: 'linkedin',
      content: m.connectionRequest,
      status: 'draft',
      metadata: {
        connection_request: m.connectionRequest,
        follow_up_1: m.followUp1,
        follow_up_2: m.followUp2,
        follow_up_3: m.followUp3 || null
      }
    }));

    const { error: insertError } = await supabase
      .from('messages')
      .insert(messagesToInsert);

    if (insertError) throw insertError;

    console.log(`Stored ${messages.length} message sets for run ${runId}`);

    return c.json({
      success: true,
      messagesStored: messages.length
    });
  } catch (error) {
    console.error('Error storing messages:', error);
    return c.json({ error: 'Failed to store messages' }, 500);
  }
});

// Receive campaign created confirmation from Make.com
app.post("/make-server-0d5eb2a5/runs/:runId/campaign-created", validateMakeComKey, async (c) => {
  try {
    const { runId } = c.req.param();
    const body = await c.req.json();
    const { heyReachCampaignId, campaigns } = body;

    // Verify run exists
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !run) {
      return c.json({ error: 'Run not found' }, 404);
    }

    const now = new Date().toISOString();

    // Update prospects to invite_sent stage
    for (const campaign of campaigns) {
      const { prospectId, heyReachCampaignId: campaignId } = campaign;

      await supabase
        .from('prospects')
        .update({
          stage: 'invite_sent',
          metadata: { heyreach_campaign_id: campaignId || heyReachCampaignId },
          last_activity_at: now
        })
        .eq('id', prospectId);
    }

    // Update run status to completed
    await supabase
      .from('runs')
      .update({
        status: 'completed',
        settings: { ...run.settings, heyReachCampaignId }
      })
      .eq('id', runId);

    console.log(`Campaign created for run ${runId}, updated ${campaigns.length} prospects to invite_sent`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing campaign created:', error);
    return c.json({ error: 'Failed to process campaign created' }, 500);
  }
});

// ============================================
// HEYREACH WEBHOOK ENDPOINTS
// ============================================

// HeyReach webhook - Invite accepted
app.post("/make-server-0d5eb2a5/webhooks/heyreach/invite-accepted", validateMakeComKey, async (c) => {
  try {
    const body = await c.req.json();
    const { prospectId, linkedinUrl, timestamp } = body;

    let prospect = null;

    // Try to find by prospectId first
    if (prospectId) {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single();
      prospect = data;
    }

    // If not found, try to find by linkedinUrl
    if (!prospect && linkedinUrl) {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('linkedin_url', linkedinUrl)
        .single();
      prospect = data;
    }

    if (!prospect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }

    // Update prospect stage
    await supabase
      .from('prospects')
      .update({
        stage: 'connected',
        last_activity_at: timestamp || new Date().toISOString()
      })
      .eq('id', prospect.id);

    console.log(`Updated prospect ${prospect.id} to connected stage`);

    return c.json({
      success: true,
      newStage: 'connected'
    });
  } catch (error) {
    console.error('Error processing invite accepted:', error);
    return c.json({ error: 'Failed to process invite accepted' }, 500);
  }
});

// HeyReach webhook - Message sent
app.post("/make-server-0d5eb2a5/webhooks/heyreach/message-sent", validateMakeComKey, async (c) => {
  try {
    const body = await c.req.json();
    const { prospectId, messageType, timestamp } = body;

    const { data: prospect } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (!prospect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }

    // Update to conversation_started if currently connected
    const newStage = prospect.stage === 'connected' ? 'conversation_started' : prospect.stage;

    await supabase
      .from('prospects')
      .update({
        stage: newStage,
        last_activity_at: timestamp || new Date().toISOString()
      })
      .eq('id', prospectId);

    console.log(`Message sent to prospect ${prospectId}, stage: ${newStage}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing message sent:', error);
    return c.json({ error: 'Failed to process message sent' }, 500);
  }
});

// HeyReach webhook - Message reply
app.post("/make-server-0d5eb2a5/webhooks/heyreach/message-reply", validateMakeComKey, async (c) => {
  try {
    const body = await c.req.json();
    const { prospectId, replyText, timestamp } = body;

    const { data: prospect } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (!prospect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }

    const now = timestamp || new Date().toISOString();

    // Update prospect stage to conversation_started
    await supabase
      .from('prospects')
      .update({
        stage: 'conversation_started',
        notes: replyText,
        last_activity_at: now
      })
      .eq('id', prospectId);

    // Create a task for the user to follow up
    await supabase
      .from('tasks')
      .insert({
        organization_id: prospect.organization_id,
        prospect_id: prospectId,
        user_id: prospect.metadata?.assigned_to || null,
        title: `Follow up with ${prospect.name}`,
        description: `Replied: "${replyText}"`,
        priority: 'high',
        status: 'pending',
        due_date: now
      });

    console.log(`Prospect ${prospectId} replied, created follow-up task`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing message reply:', error);
    return c.json({ error: 'Failed to process message reply' }, 500);
  }
});

// ============================================
// PIPELINE ENDPOINTS
// ============================================

// Get pipeline view (Frontend → Backend) - SECURED
app.get("/make-server-0d5eb2a5/pipeline", async (c) => {
  try {
    const auth = requireOrg(c);
    const stageFilter = c.req.query('stage');

    // Get prospects with optional stage filter
    let query = supabase
      .from('prospects')
      .select('*, runs(name, search_url)')
      .eq('organization_id', auth.orgId)
      .order('last_activity_at', { ascending: false });

    if (stageFilter) {
      query = query.eq('stage', stageFilter);
    }

    const { data: prospects, error } = await query;

    if (error) throw error;

    // Count prospects by stage
    const { data: stageCounts } = await supabase
      .from('prospects')
      .select('stage')
      .eq('organization_id', auth.orgId);

    const counts = {
      invite_sent: 0,
      connected: 0,
      conversation_started: 0,
      qualification: 0,
      proposal_sent: 0,
      signed_mandate: 0,
      lost: 0
    };

    stageCounts?.forEach((item: any) => {
      if (counts[item.stage] !== undefined) {
        counts[item.stage]++;
      }
    });

    return c.json({
      prospects: prospects || [],
      stageCounts: counts
    });
  } catch (error) {
    console.error('Error getting pipeline:', error);
    return c.json({ error: 'Failed to get pipeline' }, 500);
  }
});

// Update prospect pipeline stage (Frontend → Backend) - SECURED
app.put("/make-server-0d5eb2a5/prospects/:prospectId/stage", async (c) => {
  try {
    const auth = requireOrg(c);
    const { prospectId } = c.req.param();
    const body = await c.req.json();
    const { stage, notes } = body;

    const validStages = ['invite_sent', 'connected', 'conversation_started', 'qualification', 'proposal_sent', 'signed_mandate', 'lost'];
    if (!validStages.includes(stage)) {
      return c.json({ error: 'Invalid stage' }, 400);
    }

    const { error } = await supabase
      .from('prospects')
      .update({
        stage,
        notes: notes,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', prospectId)
      .eq('organization_id', auth.orgId);

    if (error) throw error;

    console.log(`Updated prospect ${prospectId} to stage ${stage}`);

    return c.json({
      success: true,
      prospectId,
      newStage: stage
    });
  } catch (error) {
    console.error('Error updating prospect stage:', error);
    return c.json({ error: 'Failed to update prospect stage' }, 500);
  }
});

// ============================================
// API KEY MANAGEMENT ENDPOINTS
// ============================================

// Create Make.com API key (Frontend → Backend - Admin only) - SECURED
app.post("/make-server-0d5eb2a5/api-keys/create", async (c) => {
  try {
    const auth = requireAdmin(c);
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: 'Missing required field: name' }, 400);
    }

    // Generate random API key
    const apiKey = `mk_${Math.random().toString(36).substr(2, 32)}`;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: auth.orgId,
        key: apiKey,
        name,
        scopes: ['make_com_webhook'],
        created_at: now
      });

    if (error) throw error;

    console.log(`Created API key for org ${auth.orgId}: ${name}`);

    return c.json({
      apiKey,
      name,
      createdAt: now,
      message: 'Store this API key securely - it will not be shown again'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return c.json({ error: 'Failed to create API key' }, 500);
  }
});

// ============================================
// JOB CLAIMS ENDPOINTS
// ============================================

// Claim a job URL - SECURED
app.post("/make-server-0d5eb2a5/claims/create", async (c) => {
  try {
    const auth = requireOrg(c);
    const body = await c.req.json();
    const { jobUrl, jobTitle, company } = body;

    if (!jobUrl) {
      return c.json({ error: 'Missing required field: jobUrl' }, 400);
    }

    // Get member name
    const { data: member } = await supabase
      .from('members')
      .select('name')
      .eq('organization_id', auth.orgId)
      .eq('id', auth.userId)
      .single();

    const userName = member?.name || 'Unknown User';

    // Check if already claimed by someone else
    const { data: existingClaim } = await supabase
      .from('job_claims')
      .select('*, member:members!job_claims_user_id_fkey(name)')
      .eq('organization_id', auth.orgId)
      .eq('job_url', jobUrl)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingClaim && existingClaim.user_id !== auth.userId) {
      return c.json({
        error: 'already_claimed',
        claimedBy: existingClaim.member?.name || 'Unknown'
      }, 409);
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Create or update claim
    const { error } = await supabase
      .from('job_claims')
      .upsert({
        organization_id: auth.orgId,
        user_id: auth.userId,
        user_name: userName,
        job_url: jobUrl,
        job_title: jobTitle,
        company,
        claimed_at: now,
        expires_at: expiresAt
      }, {
        onConflict: 'organization_id,job_url'
      });

    if (error) throw error;

    console.log(`Job claimed: ${jobUrl} by ${userName}`);

    return c.json({
      success: true,
      claim: {
        jobUrl,
        userName,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    return c.json({ error: 'Failed to create claim' }, 500);
  }
});

// Get all claims for org - SECURED
app.get("/make-server-0d5eb2a5/claims/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    // Get active claims only
    const { data: claims, error } = await supabase
      .from('job_claims')
      .select('*, member:members!job_claims_user_id_fkey(name)')
      .eq('organization_id', auth.orgId)
      .gte('expires_at', new Date().toISOString())
      .order('claimed_at', { ascending: false });

    if (error) throw error;

    return c.json({ claims: claims || [] });
  } catch (error) {
    console.error('Error getting claims:', error);
    return c.json({ error: 'Failed to get claims' }, 500);
  }
});

// Delete a claim - SECURED
app.delete("/make-server-0d5eb2a5/claims/:orgId/:claimId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId, claimId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { error } = await supabase
      .from('job_claims')
      .delete()
      .eq('id', claimId)
      .eq('organization_id', auth.orgId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting claim:', error);
    return c.json({ error: 'Failed to delete claim' }, 500);
  }
});

// ============================================
// BLACKLIST ENDPOINTS
// ============================================

// Get blacklist - SECURED
app.get("/make-server-0d5eb2a5/blacklist/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { data: blacklist, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({ blacklist: blacklist || [] });
  } catch (error) {
    console.error('Error getting blacklist:', error);
    return c.json({ error: 'Failed to get blacklist' }, 500);
  }
});

// Add to blacklist - SECURED
app.post("/make-server-0d5eb2a5/blacklist/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const body = await c.req.json();
    const { company, domain, reason } = body;

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    if (!company && !domain) {
      return c.json({ error: 'Must provide company name or domain' }, 400);
    }

    const { data: entry, error } = await supabase
      .from('blacklist')
      .insert({
        organization_id: auth.orgId,
        company,
        domain,
        reason,
        added_by: auth.userId
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, entry });
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return c.json({ error: 'Failed to add to blacklist' }, 500);
  }
});

// Bulk add to blacklist - SECURED
app.post("/make-server-0d5eb2a5/blacklist/:orgId/bulk", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const body = await c.req.json();
    const { entries } = body;

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    if (!Array.isArray(entries)) {
      return c.json({ error: 'entries must be an array' }, 400);
    }

    const entriesToInsert = entries.map((entry: any) => ({
      organization_id: auth.orgId,
      company: entry.company || null,
      domain: entry.domain || null,
      reason: entry.reason || null,
      added_by: auth.userId
    }));

    const { error } = await supabase
      .from('blacklist')
      .insert(entriesToInsert);

    if (error) throw error;

    return c.json({ success: true, count: entriesToInsert.length });
  } catch (error) {
    console.error('Error bulk adding to blacklist:', error);
    return c.json({ error: 'Failed to bulk add to blacklist' }, 500);
  }
});

// Remove from blacklist - SECURED
app.delete("/make-server-0d5eb2a5/blacklist/:orgId/:entryId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId, entryId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { error } = await supabase
      .from('blacklist')
      .delete()
      .eq('id', entryId)
      .eq('organization_id', auth.orgId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing from blacklist:', error);
    return c.json({ error: 'Failed to remove from blacklist' }, 500);
  }
});

// ============================================
// DUPLICATE CHECK ENDPOINT
// ============================================

// Check for duplicate prospects - SECURED
app.get("/make-server-0d5eb2a5/check-duplicate", async (c) => {
  try {
    const auth = requireOrg(c);
    const linkedinUrl = c.req.query('linkedinUrl');
    const name = c.req.query('name');
    const company = c.req.query('company');

    if (!linkedinUrl && (!name || !company)) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    // Search for matching prospect
    let query = supabase
      .from('prospects')
      .select('*, runs(name)')
      .eq('organization_id', auth.orgId);

    if (linkedinUrl) {
      query = query.eq('linkedin_url', linkedinUrl);
    } else if (name && company) {
      query = query.eq('name', name).eq('company', company);
    }

    const { data: prospects } = await query.limit(1).single();

    if (prospects) {
      return c.json({
        isDuplicate: true,
        prospect: prospects,
        run: prospects.runs
      });
    }

    return c.json({ isDuplicate: false });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return c.json({ error: 'Failed to check duplicate' }, 500);
  }
});

// ============================================
// TARGET ACCOUNTS ENDPOINTS
// ============================================

// Get target accounts - SECURED
app.get("/make-server-0d5eb2a5/target-accounts/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { data: accounts, error } = await supabase
      .from('target_accounts')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({ accounts: accounts || [] });
  } catch (error) {
    console.error('Error getting target accounts:', error);
    return c.json({ error: 'Failed to get target accounts' }, 500);
  }
});

// Add target account - SECURED
app.post("/make-server-0d5eb2a5/target-accounts/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const body = await c.req.json();
    const { companyName, domain, industry, priority, notes } = body;

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    if (!companyName) {
      return c.json({ error: 'Company name required' }, 400);
    }

    const { data: account, error } = await supabase
      .from('target_accounts')
      .insert({
        organization_id: auth.orgId,
        company_name: companyName,
        domain,
        industry,
        priority: priority || 'medium',
        status: 'active',
        notes,
        assigned_to: auth.userId
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, account });
  } catch (error) {
    console.error('Error adding target account:', error);
    return c.json({ error: 'Failed to add target account' }, 500);
  }
});

// Get target account details with prospects - SECURED
app.get("/make-server-0d5eb2a5/target-accounts/:orgId/:accountId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId, accountId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('target_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('organization_id', auth.orgId)
      .single();

    if (accountError || !account) {
      return c.json({ error: 'Target account not found' }, 404);
    }

    // Find all prospects from this company
    const { data: prospects } = await supabase
      .from('prospects')
      .select('*, runs(name)')
      .eq('organization_id', auth.orgId)
      .ilike('company', `%${account.company_name}%`);

    // Find all runs for this company
    const { data: runs } = await supabase
      .from('runs')
      .select('*, prospects(count)')
      .eq('organization_id', auth.orgId)
      .ilike('settings->company', `%${account.company_name}%`);

    return c.json({
      account,
      prospects: prospects || [],
      runs: runs || []
    });
  } catch (error) {
    console.error('Error getting target account details:', error);
    return c.json({ error: 'Failed to get target account details' }, 500);
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Get team performance analytics - SECURED
app.get("/make-server-0d5eb2a5/analytics/team/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const dateRange = c.req.query('dateRange') || '30'; // days

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

    // Get members
    const { data: members } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', auth.orgId);

    if (!members) {
      return c.json({ memberStats: [] });
    }

    // Initialize member stats
    const memberStats: any = {};
    members.forEach((member: any) => {
      memberStats[member.id] = {
        userId: member.id,
        userName: member.name,
        avatar: member.avatar_url,
        runsCreated: 0,
        prospectsGenerated: 0,
        connectionsEstablished: 0,
        conversationsStarted: 0
      };
    });

    // Get runs by member
    const { data: runs } = await supabase
      .from('runs')
      .select('*, prospects(count, stage)')
      .eq('organization_id', auth.orgId)
      .gte('created_at', cutoffDate.toISOString());

    runs?.forEach((run: any) => {
      if (memberStats[run.created_by]) {
        memberStats[run.created_by].runsCreated++;
        memberStats[run.created_by].prospectsGenerated += run.prospects?.[0]?.count || 0;
      }
    });

    // Get prospect stats by member
    const { data: prospects } = await supabase
      .from('prospects')
      .select('*, runs!inner(created_by)')
      .eq('organization_id', auth.orgId)
      .gte('created_at', cutoffDate.toISOString());

    prospects?.forEach((prospect: any) => {
      const userId = prospect.runs?.created_by;
      if (userId && memberStats[userId]) {
        if (prospect.stage === 'connected') {
          memberStats[userId].connectionsEstablished++;
        }
        if (prospect.stage === 'conversation_started') {
          memberStats[userId].conversationsStarted++;
        }
      }
    });

    return c.json({
      memberStats: Object.values(memberStats)
    });
  } catch (error) {
    console.error('Error getting team analytics:', error);
    return c.json({ error: 'Failed to get team analytics' }, 500);
  }
});

// Get team performance data - SECURED
app.get("/make-server-0d5eb2a5/analytics/team-performance/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const dateRange = c.req.query('dateRange') || '30'; // days

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

    // Get members
    const { data: members } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', auth.orgId);

    if (!members) {
      return c.json({ teamStats: [], orgTotals: { totalRuns: 0, totalProspects: 0, totalConnections: 0, totalDeals: 0 } });
    }

    // Initialize member stats
    const memberStats: any = {};
    members.forEach((member: any) => {
      memberStats[member.id] = {
        id: member.id,
        name: member.name,
        runsCreated: 0,
        prospectsFound: 0,
        connectionsMade: 0,
        conversationsStarted: 0,
        dealsInProgress: 0,
        dealsClosed: 0,
        responseRate: 0
      };
    });

    // Get runs by member
    const { data: runs } = await supabase
      .from('runs')
      .select('*, prospects(count, stage)')
      .eq('organization_id', auth.orgId)
      .gte('created_at', cutoffDate.toISOString());

    let totalRuns = 0;
    let totalProspects = 0;

    runs?.forEach((run: any) => {
      if (memberStats[run.created_by]) {
        memberStats[run.created_by].runsCreated++;
        totalRuns++;
        const prospectCount = run.prospects?.[0]?.count || 0;
        memberStats[run.created_by].prospectsFound += prospectCount;
        totalProspects += prospectCount;
      }
    });

    // Get prospect stats by member
    const { data: prospects } = await supabase
      .from('prospects')
      .select('*, runs!inner(created_by)')
      .eq('organization_id', auth.orgId)
      .gte('created_at', cutoffDate.toISOString());

    let totalConnections = 0;
    let totalDeals = 0;

    prospects?.forEach((prospect: any) => {
      const userId = prospect.runs?.created_by;
      if (userId && memberStats[userId]) {
        if (prospect.stage === 'connected') {
          memberStats[userId].connectionsMade++;
          totalConnections++;
        }
        if (prospect.stage === 'conversation_started') {
          memberStats[userId].conversationsStarted++;
        }
        // Count deals (conversation_started as deals in progress for now)
        if (prospect.stage === 'conversation_started' || prospect.stage === 'deal_closed') {
          memberStats[userId].dealsInProgress++;
          totalDeals++;
        }
      }
    });

    // Calculate response rates
    Object.values(memberStats).forEach((stat: any) => {
      if (stat.connectionsMade > 0) {
        stat.responseRate = Math.round((stat.conversationsStarted / stat.connectionsMade) * 100);
      }
    });

    return c.json({
      teamStats: Object.values(memberStats),
      orgTotals: {
        totalRuns,
        totalProspects,
        totalConnections,
        totalDeals
      }
    });
  } catch (error) {
    console.error('Error getting team performance:', error);
    return c.json({ error: 'Failed to get team performance' }, 500);
  }
});

// Get daily standup data - SECURED
app.get("/make-server-0d5eb2a5/analytics/daily-standup/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    // Get activity from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: members } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', auth.orgId);

    const memberActivity: any[] = [];

    // Get week's data for goal calculation
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    let weeklyConnectionsActual = 0;

    for (const member of members || []) {
      // Get runs completed in last 24 hours
      const { data: runs } = await supabase
        .from('runs')
        .select('*')
        .eq('organization_id', auth.orgId)
        .eq('created_by', member.id)
        .eq('status', 'completed')
        .gte('created_at', yesterday.toISOString());

      // Get new connections in last 24 hours
      const { data: newConnections } = await supabase
        .from('prospects')
        .select('*, runs!inner(created_by)')
        .eq('prospects.organization_id', auth.orgId)
        .eq('runs.created_by', member.id)
        .eq('prospects.stage', 'connected')
        .gte('prospects.created_at', yesterday.toISOString());

      // Get active conversations
      const { data: conversations } = await supabase
        .from('prospects')
        .select('*, runs!inner(created_by)')
        .eq('prospects.organization_id', auth.orgId)
        .eq('runs.created_by', member.id)
        .eq('prospects.stage', 'conversation_started')
        .gte('prospects.last_activity_at', yesterday.toISOString());

      // Get replies pending (tasks that are pending)
      const { data: pendingReplies } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', auth.orgId)
        .eq('user_id', member.id)
        .eq('status', 'pending')
        .gte('created_at', yesterday.toISOString());

      memberActivity.push({
        id: member.id,
        name: member.name,
        newConnections: newConnections?.length || 0,
        repliesPending: pendingReplies?.length || 0,
        conversationsActive: conversations?.length || 0,
        runsCompleted: runs?.length || 0
      });
    }

    // Get weekly connections for goal tracking
    const { data: weeklyConnections } = await supabase
      .from('prospects')
      .select('count')
      .eq('organization_id', auth.orgId)
      .eq('stage', 'connected')
      .gte('created_at', weekAgo.toISOString());

    weeklyConnectionsActual = weeklyConnections?.[0]?.count || 0;

    return c.json({ 
      memberActivity,
      teamGoals: {
        weeklyConnectionsGoal: 50,
        weeklyConnectionsActual
      }
    });
  } catch (error) {
    console.error('Error getting daily standup:', error);
    return c.json({ error: 'Failed to get daily standup' }, 500);
  }
});

// ============================================
// USER DATA ENDPOINTS (Tasks & Jobs)
// ============================================

// Get all user data (contacts, tasks, jobs) - SECURED
app.get("/make-server-0d5eb2a5/user-data/:userId", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();

    // User can only access their own data
    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get prospects (contacts) - join through runs since prospects don't have user_id
    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select('*, runs!inner(created_by)')
      .eq('runs.created_by', userId)
      .order('created_at', { ascending: false });

    if (prospectsError) {
      console.error('Error fetching prospects:', prospectsError);
    }

    // Get tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*, prospect:prospects(name, company)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    // Get runs (jobs) created by this user with prospect counts
    const { data: runs, error: runsError } = await supabase
      .from('runs')
      .select(`
        *,
        prospects (
          id,
          stage
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (runsError) {
      console.error('Error fetching runs:', runsError);
    }

    const jobs = runs?.map((run: any) => {
      const runProspects = run.prospects || [];
      const connected = runProspects.filter((p: any) => p.stage === 'connected').length;
      const conversations = runProspects.filter((p: any) => p.stage === 'conversation_started').length;

      return {
        id: run.id,
        title: run.name,
        company: run.settings?.company,
        url: run.search_url,
        status: run.status,
        createdAt: run.created_at,
        prospectCount: runProspects.length,
        connected,
        conversations
      };
    });

    // Transform prospects to include metadata fields at top level
    const transformedProspects = prospects?.map((p: any) => ({
      ...p,
      phone: p.metadata?.phone,
      tags: p.metadata?.tags || [],
      notes: p.metadata?.notes,
      last_activity_at: p.metadata?.last_activity_at,
      source: p.metadata?.source,
      location: p.metadata?.location,
    })) || [];

    return c.json({ 
      contacts: transformedProspects, 
      tasks: tasks || [], 
      jobs: jobs || [] 
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});

// Get user contacts - SECURED
app.get("/make-server-0d5eb2a5/user-data/:userId/contacts", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();

    // User can only access their own data
    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { data: contacts, error } = await supabase
      .from('prospects')
      .select('*, runs!inner(created_by)')
      .eq('runs.created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform prospects to include metadata fields at top level
    const transformedContacts = contacts?.map((p: any) => ({
      ...p,
      phone: p.metadata?.phone,
      tags: p.metadata?.tags || [],
      notes: p.metadata?.notes,
      last_activity_at: p.metadata?.last_activity_at,
      source: p.metadata?.source,
      location: p.metadata?.location,
    })) || [];

    return c.json({ contacts: transformedContacts });
  } catch (error) {
    console.error('Error getting user contacts:', error);
    return c.json({ error: 'Failed to get contacts' }, 500);
  }
});

// Save user contacts - SECURED
app.put("/make-server-0d5eb2a5/user-data/:userId/contacts", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();
    const body = await c.req.json();
    const { contacts } = body;

    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    if (!contacts || !Array.isArray(contacts)) {
      return c.json({ error: 'Invalid contacts data' }, 400);
    }

    console.log(`💾 Saving ${contacts.length} contacts for user ${userId}`);

    // Get organization ID from first manual contact (they should all have the same org)
    const manualContact = contacts.find(c => c.run_id === 'manual-add');
    let manualRunId = null;

    // If we have manual contacts, ensure a "Manual Import" run exists
    if (manualContact) {
      const orgId = manualContact.organization_id;
      
      if (!orgId || orgId === '') {
        console.error('❌ Manual contact missing organization_id:', manualContact);
        throw new Error('Cannot add manual contact: organization_id is required. Please ensure you are logged in and part of an organization.');
      }

      console.log(`🔍 Looking for Manual Import run for organization ${orgId}`);

      // Check if "Manual Import" run exists for this organization
      const { data: existingRun } = await supabase
        .from('runs')
        .select('id')
        .eq('organization_id', orgId)
        .eq('name', 'Manual Import')
        .single();

      if (existingRun) {
        manualRunId = existingRun.id;
        console.log(`✅ Found existing Manual Import run: ${manualRunId}`);
      } else {
        // Create "Manual Import" run
        const { data: newRun, error: runError } = await supabase
          .from('runs')
          .insert({
            organization_id: orgId,
            created_by: userId,
            name: 'Manual Import',
            search_url: 'manual-import',
            status: 'completed',
            settings: { manual: true }
          })
          .select()
          .single();

        if (runError) {
          console.error('❌ Error creating manual run:', runError);
          throw runError;
        }
        manualRunId = newRun.id;
        console.log(`✅ Created Manual Import run: ${manualRunId}`);
      }
    }

    // For each contact, upsert into the prospects table
    for (const contact of contacts) {
      // Migrate old contact IDs to UUID format
      let contactId = contact.id;
      if (contactId && !isValidUUID(contactId)) {
        // Generate a new UUID for old-format IDs
        contactId = crypto.randomUUID();
        console.log(`🔄 Migrating contact ID from ${contact.id} to ${contactId}`);
      }
      
      // Check if this is a manually added contact (run_id = 'manual-add')
      if (contact.run_id === 'manual-add') {
        if (!manualRunId) {
          console.error(`❌ Cannot save manual contact ${contactId}: no manual run ID available`);
          throw new Error('Manual run ID not created. Please ensure organization is set up correctly.');
        }

        // Use the actual manual run ID
        // Store extra fields in metadata JSON column
        const prospectData = {
          id: contactId,
          name: contact.name || '',
          title: contact.title || '',
          company: contact.company || '',
          linkedin_url: contact.linkedin_url || null,
          email: contact.email || null,
          stage: contact.stage || 'not_started',
          run_id: manualRunId,
          organization_id: contact.organization_id,
          metadata: {
            phone: contact.phone || '',
            tags: contact.tags || [],
            notes: contact.notes || '',
            last_activity_at: contact.last_activity_at || new Date().toISOString(),
            source: contact.source || 'Manual Entry',
            location: contact.location || '',
            manual: true
          }
        };

        console.log(`💾 Upserting manual contact ${contactId} with run_id ${manualRunId}`, {
          prospectData: JSON.stringify(prospectData, null, 2)
        });

        const { error } = await supabase
          .from('prospects')
          .upsert(prospectData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Error upserting contact ${contactId}:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          });
          throw error;
        }
      } else {
        // For contacts from runs, update existing records
        // Merge metadata fields
        const existingMetadata = contact.metadata || {};
        const updatedMetadata = {
          ...existingMetadata,
          tags: contact.tags,
          notes: contact.notes,
          last_activity_at: contact.last_activity_at,
          phone: contact.phone,
          location: contact.location,
        };

        const { error } = await supabase
          .from('prospects')
          .update({
            stage: contact.stage,
            metadata: updatedMetadata,
          })
          .eq('id', contactId);

        if (error) {
          console.error(`❌ Error updating contact ${contactId}:`, error);
          throw error;
        }
      }
    }

    console.log(`✅ Successfully saved ${contacts.length} contacts for user ${userId}`);
    
    return c.json({ success: true });
  } catch (error) {
    // Handle both Error instances and Supabase error objects
    let errorMessage = 'Unknown error';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = (error as any).details || null;
    } else if (typeof error === 'object' && error !== null) {
      // Supabase error object
      errorMessage = (error as any).message || JSON.stringify(error);
      errorDetails = (error as any).details || (error as any).hint || null;
    } else {
      errorMessage = String(error);
    }
    
    console.error('❌ Error saving user contacts:', {
      message: errorMessage,
      details: errorDetails,
      fullError: error
    });
    
    return c.json({ 
      error: 'Failed to save contacts',
      details: errorMessage,
      debugInfo: errorDetails
    }, 500);
  }
});

// Get user tasks - SECURED
app.get("/make-server-0d5eb2a5/user-data/:userId/tasks", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();

    // User can only access their own data
    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, prospect:prospects(name, company)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error getting user tasks:', error);
    return c.json({ error: 'Failed to get tasks' }, 500);
  }
});

// Save user tasks - SECURED
app.put("/make-server-0d5eb2a5/user-data/:userId/tasks", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();
    const body = await c.req.json();
    const { tasks } = body;

    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // This endpoint is for bulk task updates
    // In a real app, you'd update individual tasks
    console.log(`✅ Saved ${tasks?.length || 0} tasks for user ${userId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving user tasks:', error);
    return c.json({ error: 'Failed to save tasks' }, 500);
  }
});

// Get user jobs - SECURED
app.get("/make-server-0d5eb2a5/user-data/:userId/jobs", async (c) => {
  try {
    const auth = getAuth(c);
    const { userId } = c.req.param();

    if (userId !== auth.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get runs created by this user with prospect counts
    const { data: runs, error } = await supabase
      .from('runs')
      .select(`
        *,
        prospects (
          id,
          stage
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const jobs = runs?.map((run: any) => {
      const prospects = run.prospects || [];
      const connected = prospects.filter((p: any) => p.stage === 'connected').length;
      const conversations = prospects.filter((p: any) => p.stage === 'conversation_started').length;

      return {
        id: run.id,
        title: run.name,
        company: run.settings?.company,
        url: run.search_url,
        status: run.status,
        createdAt: run.created_at,
        prospectCount: prospects.length,
        connected,
        conversations
      };
    });

    return c.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Error getting jobs:', error);
    return c.json({ error: 'Failed to get jobs' }, 500);
  }
});

// ============================================
// ORGANIZATION MEMBERS ENDPOINTS
// ============================================

// Sync Clerk members to org (bulk update) - SECURED
app.post("/make-server-0d5eb2a5/org-members/:orgId/sync", async (c) => {
  try {
    console.log('[MEMBER SYNC] Starting member sync...');
    
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    
    console.log('[MEMBER SYNC] Verified org:', auth.orgId, 'Requested org:', requestedOrgId);
    
    if (requestedOrgId !== auth.orgId) {
      console.error('[MEMBER SYNC] Org mismatch');
      return c.json({ error: 'Access denied to this organization' }, 403);
    }
    
    const body = await c.req.json();
    const { members } = body;
    
    console.log('[MEMBER SYNC] Received members:', members?.length);
    
    if (!members || !Array.isArray(members)) {
      console.error('[MEMBER SYNC] Invalid members data');
      return c.json({ error: 'Invalid members data' }, 400);
    }
    
    // CRITICAL: Ensure organization exists before syncing members
    // This prevents foreign key constraint violations
    console.log('[MEMBER SYNC] Ensuring organization exists...');
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert(
        {
          id: auth.orgId,
          name: 'Organization', // Default name, can be updated later via settings
          plan: 'pilot', // Default plan for new organizations
          seats: 3,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'id',
          ignoreDuplicates: true // Don't update if org already exists
        }
      );
    
    if (orgError) {
      console.error('[MEMBER SYNC] Failed to ensure organization exists:', orgError);
      throw orgError;
    }
    
    console.log('[MEMBER SYNC] Organization exists or created successfully');
    
    // Upsert members to database
    const membersToUpsert = members.map((m: any) => ({
      id: m.id,
      organization_id: auth.orgId,
      email: m.email,
      name: m.name,
      avatar_url: m.imageUrl || m.avatar,
      // Ensure role is always lowercase to match database constraint
      role: (m.role || 'member').toLowerCase(),
      joined_at: m.joinedAt,
      updated_at: new Date().toISOString()
    }));

    console.log('[MEMBER SYNC] Members to upsert:', JSON.stringify(membersToUpsert, null, 2));

    const { error } = await supabase
      .from('members')
      .upsert(membersToUpsert, {
        onConflict: 'id'
      });

    if (error) throw error;
    
    console.log(`✅ Synced ${members.length} Clerk members for org ${auth.orgId}`);
    return c.json({ success: true, members });
  } catch (error) {
    console.error('[MEMBER SYNC] Error syncing org members:', error);
    console.error('[MEMBER SYNC] Error stack:', error.stack);
    return c.json({ error: 'Failed to sync org members', details: error.message }, 500);
  }
});

// Update current user's profile (name and avatar only) - SECURED
app.patch("/make-server-0d5eb2a5/members/:memberId", async (c) => {
  try {
    const auth = getAuth(c);
    const { memberId } = c.req.param();
    const body = await c.req.json();
    const { name, imageUrl } = body;

    // Users can only update their own profile
    if (memberId !== auth.userId) {
      return c.json({ error: 'Can only update your own profile' }, 403);
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name;
    if (imageUrl !== undefined) updates.avatar_url = imageUrl;

    const { error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId);

    if (error) throw error;

    console.log(`Updated member profile: ${memberId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating member:', error);
    return c.json({ error: 'Failed to update member' }, 500);
  }
});

// Get org members - SECURED
app.get("/make-server-0d5eb2a5/org-members/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied to this organization' }, 403);
    }

    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    return c.json({ members: members || [] });
  } catch (error) {
    console.error('Error getting org members:', error);
    return c.json({ error: 'Failed to get org members' }, 500);
  }
});

// Update member profile - SECURED
app.patch("/make-server-0d5eb2a5/org-members/:orgId/profile", async (c) => {
  try {
    console.log('[PROFILE UPDATE] Starting profile update...');
    
    const auth = c.get('auth') as AuthContext;
    if (!auth?.userId) {
      console.error('[PROFILE UPDATE] No auth context');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { orgId: requestedOrgId } = c.req.param();
    
    console.log('[PROFILE UPDATE] User:', auth.userId, 'Org:', requestedOrgId);
    
    // Users can only update their own profile
    const body = await c.req.json();
    const { name, avatar } = body;
    
    console.log('[PROFILE UPDATE] Updating profile with name:', name, 'avatar length:', avatar?.length);
    
    // Update the member in the database
    const { data, error } = await supabase
      .from('members')
      .update({
        name: name || null,
        avatar_url: avatar || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.userId)
      .eq('organization_id', requestedOrgId)
      .select()
      .single();
    
    if (error) {
      console.error('[PROFILE UPDATE] Database error:', error);
      throw error;
    }
    
    console.log('[PROFILE UPDATE] Profile updated successfully:', data);
    return c.json({ success: true, member: data });
  } catch (error) {
    console.error('[PROFILE UPDATE] Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Upload avatar - SECURED
app.post("/make-server-0d5eb2a5/upload-avatar", async (c) => {
  try {
    console.log('[AVATAR UPLOAD] Starting avatar upload...');
    
    const auth = c.get('auth') as AuthContext;
    if (!auth?.userId) {
      console.error('[AVATAR UPLOAD] No auth context');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const orgId = formData.get('orgId') as string;
    
    if (!file) {
      console.error('[AVATAR UPLOAD] No file provided');
      return c.json({ error: 'No file provided' }, 400);
    }
    
    console.log('[AVATAR UPLOAD] File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size exceeds 5MB limit' }, 400);
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }
    
    // Create bucket if it doesn't exist
    const bucketName = 'make-0d5eb2a5-avatars';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[AVATAR UPLOAD] Creating bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error('[AVATAR UPLOAD] Error creating bucket:', createError);
        throw createError;
      }
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${orgId}/${fileName}`;
    
    console.log('[AVATAR UPLOAD] Uploading to:', filePath);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (uploadError) {
      console.error('[AVATAR UPLOAD] Upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('[AVATAR UPLOAD] Upload successful:', uploadData);
    
    // Get signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (urlError) {
      console.error('[AVATAR UPLOAD] Error creating signed URL:', urlError);
      throw urlError;
    }
    
    const avatarUrl = urlData.signedUrl;
    console.log('[AVATAR UPLOAD] Signed URL created');
    
    return c.json({ avatarUrl });
  } catch (error) {
    console.error('[AVATAR UPLOAD] Error uploading avatar:', error);
    return c.json({ error: 'Failed to upload avatar' }, 500);
  }
});

// ============================================
// MESSAGES ROUTES
// ============================================

app.route('/make-server-0d5eb2a5', messagesRoutes);

// ============================================
// USAGE TRACKING ENDPOINTS
// ============================================

// Get organization usage
app.get("/make-server-0d5eb2a5/usage/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    // Get plan limits (default to pilot)
    const { data: limits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan_name', 'pilot')
      .single();

    // Default values if no records exist
    const currentUsage = usage || {
      runs_used: 0,
      prospects_used: 0,
      messages_used: 0,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const planLimits = limits || {
      plan_name: 'pilot',
      runs_limit: 10,
      prospects_limit: 100,
      messages_limit: 500
    };

    return c.json({
      usage: {
        runs: { used: currentUsage.runs_used || 0, limit: planLimits.runs_limit },
        prospects: { used: currentUsage.prospects_used || 0, limit: planLimits.prospects_limit },
        messages: { used: currentUsage.messages_used || 0, limit: planLimits.messages_limit }
      },
      plan: planLimits.plan_name,
      periodStart: currentUsage.period_start,
      periodEnd: currentUsage.period_end
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    return c.json({ error: 'Failed to get usage' }, 500);
  }
});

// Check if action is allowed
app.post("/make-server-0d5eb2a5/usage/:orgId/check", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId: requestedOrgId } = c.req.param();
    const body = await c.req.json();
    const { metric, amount } = body;

    if (requestedOrgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    // Get plan limits
    const { data: limits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan_name', 'pilot')
      .single();

    const used = usage?.[`${metric}_used`] || 0;
    const limit = limits?.[`${metric}_limit`] || 10;

    // -1 means unlimited
    if (limit === -1) {
      return c.json({ allowed: true, current: used, limit: -1, remaining: -1 });
    }

    const remaining = limit - used;
    return c.json({
      allowed: remaining >= (amount || 1),
      current: used,
      limit: limit,
      remaining: Math.max(0, remaining)
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    return c.json({ error: 'Failed to check usage' }, 500);
  }
});

// Get available plans
app.get("/make-server-0d5eb2a5/plans", async (c) => {
  try {
    const { data: plans } = await supabase
      .from('plan_limits')
      .select('*')
      .order('price_usd', { ascending: true });

    return c.json({ plans: plans || [] });
  } catch (error) {
    console.error('Error getting plans:', error);
    return c.json({ error: 'Failed to get plans' }, 500);
  }
});

// ============================================
// WARMUP SYSTEM
// ============================================

// Helper: Get warmup limits for a given day
function getWarmupLimits(daysSinceStart: number): { maxRuns: number; maxInvites: number } | null {
  if (daysSinceStart <= 2) return { maxRuns: 1, maxInvites: 3 };
  if (daysSinceStart <= 4) return { maxRuns: 1, maxInvites: 5 };
  if (daysSinceStart <= 7) return { maxRuns: 2, maxInvites: 10 };
  if (daysSinceStart <= 10) return { maxRuns: 3, maxInvites: 15 };
  if (daysSinceStart <= 14) return { maxRuns: 4, maxInvites: 20 };
  return null; // Warmup complete
}

// Helper: Calculate days between dates
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get warmup status
app.get("/make-server-0d5eb2a5/warmup/:orgId", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId } = c.req.param();

    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get or create warmup status
    let { data: warmup } = await supabase
      .from('warmup_status')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    // Create if doesn't exist
    if (!warmup) {
      const { data: newWarmup } = await supabase
        .from('warmup_status')
        .insert({
          organization_id: auth.orgId,
          start_date: new Date().toISOString(),
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      warmup = newWarmup;
    }

    // Reset daily counts if new day
    const today = new Date().toISOString().split('T')[0];
    if (warmup.last_reset_date !== today) {
      await supabase
        .from('warmup_status')
        .update({
          daily_runs_created: 0,
          daily_invites_sent: 0,
          last_reset_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', auth.orgId);
      warmup.daily_runs_created = 0;
      warmup.daily_invites_sent = 0;
    }

    const startDate = new Date(warmup.start_date);
    const daysSinceStart = daysBetween(startDate, new Date());
    const limits = getWarmupLimits(daysSinceStart);

    if (!limits || warmup.completed) {
      return c.json({
        warmupComplete: true,
        daysSinceStart,
        totalDays: 14,
        progress: 100
      });
    }

    return c.json({
      warmupComplete: false,
      daysSinceStart,
      totalDays: 14,
      progress: Math.round((daysSinceStart / 14) * 100),
      today: {
        runsUsed: warmup.daily_runs_created,
        runsLimit: limits.maxRuns,
        runsRemaining: limits.maxRuns - warmup.daily_runs_created,
        invitesUsed: warmup.daily_invites_sent,
        invitesLimit: limits.maxInvites,
        invitesRemaining: limits.maxInvites - warmup.daily_invites_sent
      },
      daysUntilFullAccess: Math.max(0, 14 - daysSinceStart),
      schedule: {
        tomorrow: getWarmupLimits(daysSinceStart + 1),
        nextWeek: getWarmupLimits(daysSinceStart + 7)
      }
    });
  } catch (error) {
    console.error('Error getting warmup status:', error);
    return c.json({ error: 'Failed to get warmup status' }, 500);
  }
});

// Check warmup limit before action
app.post("/make-server-0d5eb2a5/warmup/:orgId/check", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId } = c.req.param();
    const body = await c.req.json();
    const { action } = body; // 'run' or 'invite'

    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get warmup status
    let { data: warmup } = await supabase
      .from('warmup_status')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    if (!warmup) {
      // Create new warmup record
      const { data: newWarmup } = await supabase
        .from('warmup_status')
        .insert({
          organization_id: auth.orgId,
          start_date: new Date().toISOString(),
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      warmup = newWarmup;
    }

    // If warmup complete, allow everything
    if (warmup.completed) {
      return c.json({ allowed: true, warmupComplete: true });
    }

    // Reset daily counts if new day
    const today = new Date().toISOString().split('T')[0];
    if (warmup.last_reset_date !== today) {
      await supabase
        .from('warmup_status')
        .update({
          daily_runs_created: 0,
          daily_invites_sent: 0,
          last_reset_date: today
        })
        .eq('organization_id', auth.orgId);
      warmup.daily_runs_created = 0;
      warmup.daily_invites_sent = 0;
    }

    const daysSinceStart = daysBetween(new Date(warmup.start_date), new Date());
    const limits = getWarmupLimits(daysSinceStart);

    // Warmup period over
    if (!limits) {
      // Mark as complete
      await supabase
        .from('warmup_status')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('organization_id', auth.orgId);

      return c.json({ allowed: true, warmupComplete: true });
    }

    // Check limits
    if (action === 'run') {
      if (warmup.daily_runs_created >= limits.maxRuns) {
        return c.json({
          allowed: false,
          reason: 'warmup_limit',
          message: `Warmup day ${daysSinceStart}: You've used all ${limits.maxRuns} runs for today. Come back tomorrow!`,
          current: warmup.daily_runs_created,
          limit: limits.maxRuns,
          daysSinceStart,
          daysRemaining: 14 - daysSinceStart
        });
      }
    }

    if (action === 'invite') {
      if (warmup.daily_invites_sent >= limits.maxInvites) {
        return c.json({
          allowed: false,
          reason: 'warmup_limit',
          message: `Warmup day ${daysSinceStart}: You've sent all ${limits.maxInvites} invites for today.`,
          current: warmup.daily_invites_sent,
          limit: limits.maxInvites,
          daysSinceStart,
          daysRemaining: 14 - daysSinceStart
        });
      }
    }

    return c.json({
      allowed: true,
      warmupComplete: false,
      daysSinceStart,
      runsRemaining: limits.maxRuns - warmup.daily_runs_created,
      invitesRemaining: limits.maxInvites - warmup.daily_invites_sent
    });
  } catch (error) {
    console.error('Error checking warmup limit:', error);
    return c.json({ error: 'Failed to check warmup' }, 500);
  }
});

// Increment warmup counters (call after successful action)
app.post("/make-server-0d5eb2a5/warmup/:orgId/increment", async (c) => {
  try {
    const auth = requireOrg(c);
    const { orgId } = c.req.param();
    const body = await c.req.json();
    const { action, amount = 1 } = body;

    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const updateField = action === 'run' ? 'daily_runs_created' : 'daily_invites_sent';
    const totalField = action === 'run' ? 'total_runs_created' : 'total_invites_sent';

    // Get current values
    const { data: warmup } = await supabase
      .from('warmup_status')
      .select('*')
      .eq('organization_id', auth.orgId)
      .single();

    if (warmup) {
      await supabase
        .from('warmup_status')
        .update({
          [updateField]: (warmup[updateField] || 0) + amount,
          [totalField]: (warmup[totalField] || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', auth.orgId);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error incrementing warmup:', error);
    return c.json({ error: 'Failed to increment' }, 500);
  }
});

// ============================================
// CRM UPGRADE: ACTIVITIES
// ============================================

// Get activities for a prospect
app.get("/make-server-0d5eb2a5/activities/:prospectId", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required', activities: [] }, 401);
    }
    
    const { prospectId } = c.req.param();
    
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('organization_id', auth.orgId)
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    return c.json({ activities: activities || [] });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// Log a new activity
app.post("/make-server-0d5eb2a5/activities", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required' }, 401);
    }
    
    const body = await c.req.json();
    const { prospectId, activityType, title, description, metadata } = body;
    
    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        organization_id: auth.orgId,
        prospect_id: prospectId,
        user_id: auth.userId,
        activity_type: activityType,
        title: title,
        description: description || null,
        metadata: metadata || {}
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ activity });
  } catch (error) {
    console.error('Error logging activity:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// ============================================
// CRM UPGRADE: CUSTOM FIELDS
// ============================================

// Get custom field definitions for org
app.get("/make-server-0d5eb2a5/custom-fields/:orgId", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required', fields: [] }, 401);
    }
    
    const { orgId } = c.req.param();
    
    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    // Get org-specific fields + default fields
    const { data: fields, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .or(`organization_id.eq.${auth.orgId},organization_id.eq.default`)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return c.json({ fields: fields || [] });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return c.json({ error: 'Failed to fetch custom fields' }, 500);
  }
});

// Create custom field definition
app.post("/make-server-0d5eb2a5/custom-fields/:orgId", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required' }, 401);
    }
    
    const { orgId } = c.req.param();
    const body = await c.req.json();
    
    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const { fieldName, fieldLabel, fieldType, options, isRequired } = body;
    
    const { data: field, error } = await supabase
      .from('custom_field_definitions')
      .insert({
        organization_id: auth.orgId,
        field_name: fieldName,
        field_label: fieldLabel,
        field_type: fieldType,
        options: options || [],
        is_required: isRequired || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ field });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return c.json({ error: 'Failed to create custom field' }, 500);
  }
});

// Get custom field values for a prospect
app.get("/make-server-0d5eb2a5/custom-fields/:orgId/values/:prospectId", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required', values: [] }, 401);
    }
    
    const { orgId, prospectId } = c.req.param();
    
    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const { data: values, error } = await supabase
      .from('custom_field_values')
      .select(`
        *,
        field:custom_field_definitions(*)
      `)
      .eq('organization_id', auth.orgId)
      .eq('prospect_id', prospectId);
    
    if (error) throw error;
    
    return c.json({ values: values || [] });
  } catch (error) {
    console.error('Error fetching custom field values:', error);
    return c.json({ error: 'Failed to fetch values' }, 500);
  }
});

// Save custom field value
app.put("/make-server-0d5eb2a5/custom-fields/:orgId/values/:prospectId", async (c) => {
  try {
    const auth = c.get('auth') as AuthContext;
    if (!auth?.orgId) {
      return c.json({ error: 'Organization context required' }, 401);
    }
    
    const { orgId, prospectId } = c.req.param();
    const body = await c.req.json();
    
    if (orgId !== auth.orgId) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const { fieldId, value } = body;
    
    const { data: savedValue, error } = await supabase
      .from('custom_field_values')
      .upsert({
        organization_id: auth.orgId,
        prospect_id: prospectId,
        field_id: fieldId,
        value: value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'prospect_id,field_id' })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log activity
    await supabase.from('activities').insert({
      organization_id: auth.orgId,
      prospect_id: prospectId,
      user_id: auth.userId,
      activity_type: 'field_updated',
      title: 'Custom field updated',
      metadata: { fieldId, value }
    });
    
    return c.json({ value: savedValue });
  } catch (error) {
    console.error('Error saving custom field value:', error);
    return c.json({ error: 'Failed to save value' }, 500);
  }
});

// ============================================
// CRM UPGRADE: DEAL VALUE (Quick endpoint)
// ============================================

// Update prospect with deal value
app.patch("/make-server-0d5eb2a5/prospects/:prospectId/deal", async (c) => {
  try {
    const auth = requireOrg(c);
    const { prospectId } = c.req.param();
    const body = await c.req.json();
    const { dealValue, currency } = body;
    
    // Get existing prospect from KV
    const existingProspect = await kv.get(`prospect:${prospectId}`);
    if (!existingProspect) {
      return c.json({ error: 'Prospect not found' }, 404);
    }
    
    // Update with deal value
    const updatedProspect = {
      ...existingProspect,
      dealValue: dealValue,
      dealCurrency: currency || 'USD',
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`prospect:${prospectId}`, updatedProspect);
    
    // Log activity
    await supabase.from('activities').insert({
      organization_id: auth.orgId,
      prospect_id: prospectId,
      user_id: auth.userId,
      activity_type: 'deal_updated',
      title: `Deal value set to ${currency || 'USD'} ${dealValue}`,
      metadata: { dealValue, currency }
    });
    
    return c.json({ prospect: updatedProspect });
  } catch (error) {
    console.error('Error updating deal value:', error);
    return c.json({ error: 'Failed to update deal value' }, 500);
  }
});

console.log('[INIT] All routes registered successfully');
console.log('[INIT] Starting Deno server...');

try {
  Deno.serve(app.fetch);
  console.log('[INIT] Deno server started successfully');
} catch (error) {
  console.error('[INIT] FATAL ERROR starting Deno server:', error);
  console.error('[INIT] Error stack:', error.stack);
}