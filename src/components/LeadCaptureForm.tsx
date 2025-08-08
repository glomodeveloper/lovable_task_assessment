import { useState } from 'react';
import { Mail, User, CheckCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateLeadForm, ValidationError } from '@/lib/validation';
import { useLeadStore } from '@/lib/lead-store';

const LeadCaptureForm = () => {
  // State management
  const [formState, setFormState] = useState({
    values: { name: '', email: '', industry: '' },
    errors: [] as ValidationError[],
    isComplete: false
  });
  
  const { leads, addLead } = useLeadStore();

  // Helper functions
  const getErrorForField = (field: string) => 
    formState.errors.find(e => e.field === field)?.message;

  const updateField = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: prev.errors.filter(e => e.field !== field)
    }));
  };

  // Form submission
  const processSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResults = validateLeadForm(formState.values);
    if (validationResults.length > 0) {
      setFormState(prev => ({ ...prev, errors: validationResults }));
      return;
    }

    try {
      const apiResponse = await fetch('https://ytyopyznqpnylebzibby.supabase.co/functions/v1/clever-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eW9weXpucXBueWxlYnppYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI3NTUsImV4cCI6MjA3MDEyODc1NX0.nr9WV_ybqZ6PpWT6GjAQm0Bsdr-Q5IejEhToV34VY4E`
        },
        body: JSON.stringify(formState.values)
      });

      if (!apiResponse.ok) throw new Error('Submission failed');

      const newLead = {
        ...formState.values,
        submitted_at: new Date().toISOString()
      };

      await addLead(newLead);
      setFormState({
        values: { name: '', email: '', industry: '' },
        errors: [],
        isComplete: true
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Success view component
  if (formState.isComplete) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-background/90 border rounded-xl p-8 shadow-xl backdrop-blur-sm text-center">
          <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">Successfully Registered!</h2>
          <p className="text-muted-foreground mb-6">We've added you to our priority list.</p>
          
          <div className="bg-secondary/30 p-4 rounded-lg mb-6 border border-secondary/50">
            <p className="text-sm">
              <span className="font-medium">Your position:</span> #{leads.length}
            </p>
          </div>
          
          <Button 
            onClick={() => setFormState(p => ({ ...p, isComplete: false }))}
            variant="secondary"
            className="w-full"
          >
            Register Another
          </Button>
          
          <p className="text-xs mt-6 pt-4 border-t border-border/50 text-muted-foreground">
            Expect our first update within 48 hours
          </p>
        </div>
      </div>
    );
  }

  // Main form component
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-background/90 border rounded-xl p-8 shadow-xl backdrop-blur-sm">
        <header className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-500/20">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Early Access Signup</h2>
          <p className="text-muted-foreground">Secure your spot before launch</p>
        </header>

        <form onSubmit={processSubmission} className="space-y-5">
          <FormField
            icon={<User className="w-5 h-5" />}
            label="Full Name"
            value={formState.values.name}
            onChange={(v) => updateField('name', v)}
            error={getErrorForField('name')}
            placeholder="Enter your full name"
          />
          
          <FormField
            icon={<Mail className="w-5 h-5" />}
            label="Email Address"
            type="email"
            value={formState.values.email}
            onChange={(v) => updateField('email', v)}
            error={getErrorForField('email')}
            placeholder="your@email.com"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry Sector</label>
            <Select 
              value={formState.values.industry} 
              onValueChange={(v) => updateField('industry', v)}
            >
              <SelectTrigger className={`w-full ${getErrorForField('industry') ? 'border-destructive' : ''}`}>
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-3 text-muted-foreground" />
                  <SelectValue placeholder="Select industry" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Other'].map(opt => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getErrorForField('industry') && (
              <p className="text-sm text-destructive">{getErrorForField('industry')}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full mt-6" size="lg">
            Join Waitlist
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          We respect your privacy. No spam, ever.
        </p>
      </div>
    </div>
  );
};

// Reusable form field component
const FormField = ({ icon, label, error, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <Input
        className={`pl-10 ${error ? 'border-destructive' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default LeadCaptureForm;