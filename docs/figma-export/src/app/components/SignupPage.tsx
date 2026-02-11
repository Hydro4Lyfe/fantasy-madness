import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Trophy, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  // Mock list of taken usernames (in a real app, this would be an API call)
  const takenUsernames = ['admin', 'user', 'test', 'johndoe', 'basketball', 'madness'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error and valid state when user starts typing in username
    if (name === 'username') {
      setIsUsernameValid(false);
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleUsernameBlur = async () => {
    if (!formData.username) return;

    setIsChecking(true);
    setIsUsernameValid(false);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if username is taken
    if (takenUsernames.includes(formData.username.toLowerCase())) {
      setErrors({
        ...errors,
        username: 'This username is already taken. Please choose another one.',
      });
      setIsUsernameValid(false);
    } else if (formData.username.length >= 3) {
      // Username is available and valid
      setIsUsernameValid(true);
      setErrors({
        ...errors,
        username: '',
      });
    }
    
    setIsChecking(false);
  };

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (takenUsernames.includes(formData.username.toLowerCase())) {
      newErrors.username = 'This username is already taken';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Handle signup logic here
      console.log('Signup attempt:', formData);
      // Navigate to dashboard on successful signup
      onNavigate('dashboard');
    }
  };

  const benefits = [
    'Free bracket and fantasy team creation',
    'Join unlimited public leagues',
    'Real-time scoring and updates',
    'Mobile app access',
  ];

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-muted/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-5xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 text-foreground hover:text-foreground/80"
          onClick={() => onNavigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Benefits */}
          <div className="hidden lg:block space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BracketMadness</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Join 50,000+ Players
              </h1>
              <p className="text-lg text-muted-foreground">
                Create your account and start competing in the most exciting March Madness fantasy experience.
              </p>
            </div>

            <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-foreground">What you'll get:</h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">50K+</div>
                <div className="text-xs text-muted-foreground">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">$100K</div>
                <div className="text-xs text-muted-foreground">Prize Pool</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">4.9★</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="p-8 bg-card border-border shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-muted-foreground mt-1">Get started in less than 2 minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-background border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleUsernameBlur}
                    className={`bg-background border-border pr-10 ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : isUsernameValid ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                    required
                  />
                  {/* Icon inside input */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isChecking && (
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    {!isChecking && isUsernameValid && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                    {!isChecking && errors.username && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {isChecking && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Checking availability...
                  </p>
                )}
                {errors.username && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username}
                  </p>
                )}
                {isUsernameValid && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Username is available
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-background border-border"
                  required
                />
                {errors.email && <p className="text-xs text-red-500"><AlertCircle className="w-4 h-4 mr-1 inline" /> {errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-background border-border"
                  required
                />
                {errors.password && <p className="text-xs text-red-500"><AlertCircle className="w-4 h-4 mr-1 inline" /> {errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-background border-border"
                  required
                />
                {errors.confirmPassword && <p className="text-xs text-red-500"><AlertCircle className="w-4 h-4 mr-1 inline" /> {errors.confirmPassword}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                  />
                  <label
                    htmlFor="newsletter"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    Send me tournament updates and exclusive offers
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 h-11"
              >
                Create Account
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            {/* Social signup buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}