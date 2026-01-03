import { Mail, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What inputs are supported?',
      answer: 'You can provide either a LinkedIn job post URL (e.g., https://www.linkedin.com/jobs/view/12345...) or paste the full job description text. Job search URLs are not supported - please provide a single, specific job posting.'
    },
    {
      question: 'How long does a run take?',
      answer: 'Most runs complete in 2-3 minutes. The process includes analyzing the job posting, finding decision makers via Apollo, generating personalized messages, and creating a campaign in HeyReach. Complex runs may take up to 5 minutes.'
    },
    {
      question: 'Why is my campaign paused by default?',
      answer: 'Campaigns are created in a paused state to allow you to review the prospects and messages before activating. This gives you full control and ensures quality. You can activate the campaign directly in HeyReach when ready.'
    },
    {
      question: 'What happens if my session expires?',
      answer: 'For security, sessions automatically expire after 30 minutes of inactivity. You\'ll see a notification and be prompted to sign in again. Your work is saved, so you can continue where you left off. Press Ctrl+Shift+T to test the session timeout modal.'
    },
    {
      question: 'What happens if I hit my usage limit?',
      answer: 'If you reach your monthly limit for runs or prospects, you won\'t be able to create new runs until your billing period resets. You can upgrade your plan at any time in the Billing section, or contact support for assistance.'
    },
    {
      question: 'How do I connect HeyReach and Apollo?',
      answer: 'Go to the Integrations page and click "Connect" for each service. You\'ll be redirected to authorize the connection. Both integrations are required for the platform to function properly.'
    },
    {
      question: 'Can I customize the message templates?',
      answer: 'Currently, messages are auto-generated based on the job posting and prospect information. Custom templates and advanced personalization will be available in a future update. Contact support if you need specific messaging requirements.'
    },
    {
      question: 'What if a run fails?',
      answer: 'Common failure reasons include: Apollo API limits reached, invalid job post URL, or integration connection issues. Check the error message on the run detail page for specific guidance. Most issues resolve within 24 hours, or you can contact support.'
    },
    {
      question: 'How do team seats work?',
      answer: 'Each plan includes a certain number of seats. Admin users can invite team members from the Team page. Members can create runs and view data, while Admins have full access including billing and team management.'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1>Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or contact our support team
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <a
          href="mailto:support@linkedinautomation.com"
          className="glass-card p-6 rounded-xl hover:bg-accent/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3>Email Support</h3>
              <p className="text-sm text-muted-foreground mt-1">
                support@linkedinautomation.com
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Response within 24 hours
              </p>
            </div>
          </div>
        </a>

        <a
          href="https://docs.linkedinautomation.com"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-6 rounded-xl hover:bg-accent/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-info" />
            </div>
            <div>
              <h3>Documentation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Guides and tutorials
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete platform documentation
              </p>
            </div>
          </div>
        </a>
      </div>

      {/* FAQ */}
      <div className="glass-card p-8 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
              >
                <h3>{faq.question}</h3>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="pb-4">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-6 glass-card rounded-xl border-l-4 border-info">
        <h3 className="mb-2">Not finding what you need?</h3>
        <p className="text-muted-foreground mb-4">
          Our support team is here to help. Email us at{' '}
          <a href="mailto:support@linkedinautomation.com" className="text-primary hover:underline">
            support@linkedinautomation.com
          </a>
          {' '}and we'll get back to you as soon as possible.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Note:</strong> This platform is designed for B2B recruiting automation. It is not intended for collecting PII (Personally Identifiable Information) or securing sensitive data. Please ensure compliance with applicable data protection regulations.
        </p>
      </div>
    </div>
  );
}