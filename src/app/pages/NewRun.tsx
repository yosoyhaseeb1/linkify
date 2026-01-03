import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Plus, X, Users, Flag, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function NewRun() {
  const [jobUrls, setJobUrls] = useState(['']);
  const [maxProspects, setMaxProspects] = useState('50');
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();

  const validateInput = (value: string) => {
    if (!value.trim()) {
      return 'Please provide a LinkedIn job post URL or job description';
    }

    // Check if it looks like a job search URL (not allowed)
    if (value.includes('/jobs/search/') || value.includes('?keywords=')) {
      return 'Job search URLs are not supported. Please provide a single job post URL or job description.';
    }

    return '';
  };

  const handleAddJobUrl = () => {
    setJobUrls([...jobUrls, '']);
    setErrors([...errors, '']);
  };

  const handleRemoveJobUrl = (index: number) => {
    const newJobUrls = jobUrls.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setJobUrls(newJobUrls.length > 0 ? newJobUrls : ['']);
    setErrors(newErrors.length > 0 ? newErrors : ['']);
  };

  const handleJobUrlChange = (index: number, value: string) => {
    const newJobUrls = [...jobUrls];
    newJobUrls[index] = value;
    setJobUrls(newJobUrls);
    
    // Clear error when user starts typing
    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleBlurValidation = (index: number) => {
    const newErrors = [...errors];
    newErrors[index] = validateInput(jobUrls[index]);
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg) {
      toast.error('Organization information not available');
      return;
    }

    // Validate all inputs
    const newErrors = jobUrls.map(url => validateInput(url));
    const hasErrors = newErrors.some(error => error !== '');
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      // Check each job URL and create runs
      const urlsToCheck = jobUrls.filter(url => url.trim());
      
      for (const jobUrl of urlsToCheck) {
        // Create run - the server will check for duplicates
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/runs/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // orgId and userId now come from JWT - NOT from request body
              jobUrl,
              jobTitle: null,  // Will be extracted by Make.com
              company: null     // Will be extracted by Make.com
            }),
          }
        );

        const data = await response.json();

        if (response.status === 409 && data.error === 'duplicate_job_url') {
          // Duplicate found!
          setLoading(false);
          const existingRun = data.existingRun;
          const createdDate = new Date(existingRun.createdAt).toLocaleDateString();
          
          // Update the specific error for this job URL
          const errorIndex = jobUrls.indexOf(jobUrl);
          const newErrors = [...errors];
          newErrors[errorIndex] = `This job was already run by ${existingRun.userName} on ${createdDate}`;
          setErrors(newErrors);
          
          toast.error(
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Duplicate Job Detected
              </div>
              <div className="text-sm">
                <strong>{existingRun.userName}</strong> already ran this job on {createdDate}
              </div>
              <button
                onClick={() => navigate(`/runs/${existingRun.id}`)}
                className="text-xs underline hover:no-underline"
              >
                View their run →
              </button>
            </div>
          );
          return;
        } else if (response.status === 403 && data.error === 'warmup_limit') {
          // Warmup limit reached
          setLoading(false);
          toast.error(
            <div className="space-y-1">
              <div className="font-semibold">🔥 Warmup Limit Reached</div>
              <div className="text-sm opacity-80">{data.message}</div>
              <div className="text-xs mt-1 opacity-60">
                Tomorrow's limit: {data.tomorrowLimit} runs
              </div>
            </div>,
            { duration: 6000 }
          );
          return;
        } else if (response.status === 403 && data.error === 'usage_limit_exceeded') {
          // Usage limit exceeded
          setLoading(false);
          toast.error(data.message, { duration: 5000 });
          return;
        } else if (!response.ok) {
          throw new Error(data.error || 'Failed to create run');
        }

        // Success for this URL
        console.log(`Run created: ${data.runId}`);
      }

      // All runs created successfully
      toast.success(`Run${urlsToCheck.length > 1 ? 's' : ''} started successfully for ${urlsToCheck.length} job post${urlsToCheck.length > 1 ? 's' : ''}!`);
      navigate('/runs');
    } catch (err) {
      console.error('Error creating run:', err);
      toast.error('Failed to start run. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1>New Automation Run</h1>
        <p className="text-muted-foreground mt-2">
          Paste a LinkedIn job post URL or job description to find decision makers
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-xl space-y-6">
        <div>
          <label className="block mb-3">
            LinkedIn Job Post URLs
          </label>
          <div className="space-y-3">
            {jobUrls.map((url, index) => (
              <div key={index}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleJobUrlChange(index, e.target.value)}
                    onBlur={() => handleBlurValidation(index)}
                    placeholder="https://www.linkedin.com/jobs/view/12345..."
                    className={`flex-1 px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors[index] ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {jobUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveJobUrl(index)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {index === jobUrls.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddJobUrl}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {errors[index] && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors[index]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Add multiple LinkedIn job post URLs to run automation for each
          </p>
        </div>

        <div>
          <label htmlFor="max-prospects" className="block mb-2">
            Maximum Prospects (Optional)
          </label>
          <select
            id="max-prospects"
            value={maxProspects}
            onChange={(e) => setMaxProspects(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="25">25 prospects</option>
            <option value="50">50 prospects</option>
            <option value="100">100 prospects</option>
            <option value="200">200 prospects</option>
          </select>
          <p className="text-sm text-muted-foreground mt-2">
            Limit the number of prospects to find for this run
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">1.</span>
              <span>We'll analyze the job posting and identify the right decision makers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">2.</span>
              <span>Draft personalized connection messages for each prospect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">3.</span>
              <span>Create a campaign in HeyReach (paused by default)</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Estimated time: 2-3 minutes
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || jobUrls.every(url => !url.trim())}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Starting Run...' : 'Run Automation'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}