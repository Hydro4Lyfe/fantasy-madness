import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  Trophy,
  Users,
  TrendingUp,
  Zap,
  Target,
  Crown,
  Calendar,
  DollarSign,
  CheckCircle2,
  Play,
  Star,
  Award,
  BarChart3,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface BracketMadnessLandingProps {
  onNavigate: (page: string) => void;
}

export function BracketMadnessLanding({ onNavigate }: BracketMadnessLandingProps) {
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Build Your Bracket',
      description: 'Create your perfect March Madness bracket and draft your fantasy team simultaneously',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Compete with Friends',
      description: 'Join leagues, challenge rivals, and climb the leaderboard as the tournament progresses',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Live Scoring',
      description: 'Get real-time updates as your bracket picks and fantasy players rack up points',
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: 'Win Big Prizes',
      description: 'Compete for cash prizes, exclusive rewards, and ultimate bragging rights',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Account',
      description: 'Sign up in seconds and join the madness',
      icon: <Target className="w-6 h-6" />,
    },
    {
      step: '2',
      title: 'Fill Your Bracket',
      description: 'Pick winners for all 67 tournament games',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      step: '3',
      title: 'Draft Your Team',
      description: 'Build your fantasy roster from tournament players',
      icon: <Users className="w-6 h-6" />,
    },
    {
      step: '4',
      title: 'Track & Win',
      description: 'Watch your points accumulate and compete for glory',
      icon: <Trophy className="w-6 h-6" />,
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Players' },
    { value: '$100K', label: 'Prize Pool' },
    { value: '1,000+', label: 'Leagues' },
    { value: '4.9★', label: 'User Rating' },
  ];

  const pricingTiers = [
    {
      name: 'Free Entry',
      price: '$0',
      description: 'Perfect for casual fans',
      features: [
        'Basic bracket creation',
        'Join public leagues',
        'Real-time scoring',
        'Mobile app access',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Premium League',
      price: '$25',
      description: 'For serious competitors',
      features: [
        'Everything in Free',
        'Private league creation',
        'Advanced analytics',
        'Prize pool entry',
        'Custom scoring rules',
        'Priority support',
      ],
      cta: 'Join Premium',
      popular: true,
    },
    {
      name: 'Championship',
      price: '$100',
      description: 'Elite tournament experience',
      features: [
        'Everything in Premium',
        'Exclusive prize pools',
        'VIP league access',
        'Expert picks & insights',
        'Live draft assistant',
        'Tournament predictions',
      ],
      cta: 'Go Elite',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Fixed background image */}
      <div className="fixed inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920"
          alt="Basketball court background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90" />
        {/* Subtle noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        {/* Orange accent glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header/Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">BracketMadness</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onNavigate('login')} className="border-white/70 text-white hover:bg-white/10 hover:border-white">
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700" onClick={() => onNavigate('signup')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1570587031956-6b6d5694ea11?w=1920"
            alt="Basketball arena"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6 sm:mb-8">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs sm:text-sm text-orange-400 font-medium">March Madness 2026 is Here!</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-foreground">
              Fantasy Madness
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
              Build your perfect bracket, compete with friends, and win big in the ultimate March Madness fantasy experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 h-12 sm:h-14 px-8 text-base sm:text-lg"
                onClick={() => onNavigate('signup')}
              >
                <Trophy className="mr-2 w-5 h-5" />
                Join Global Championship
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg border-white/30 text-white hover:bg-white/10 hover:border-white"
                onClick={() => onNavigate('signup')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-12 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-400">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Players</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-400">$100K</div>
                <div className="text-sm text-muted-foreground mt-1">Prize Pool</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-400">4.9★</div>
                <div className="text-sm text-muted-foreground mt-1">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need to Dominate
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Combining the best of bracket challenges and fantasy sports
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card border-border hover:border-purple-500/50 transition-all hover:scale-105"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500/20 to-purple-600/20 flex items-center justify-center text-orange-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Get Started in Minutes
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Four simple steps to championship glory
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <Card
                key={index}
                className="p-6 bg-card border-border hover:border-orange-500/50 transition-all relative"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>
                
                <div className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500/20 to-purple-600/20 flex items-center justify-center text-orange-400">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Preview Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                <Play className="w-4 h-4 mr-1 inline" />
                Live Now
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Dual Scoring System
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Earn points two ways: predict bracket outcomes correctly AND rack up fantasy 
                points from your drafted players' real game performances. Double the strategy, 
                double the excitement.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Bracket Points</h4>
                    <p className="text-sm text-muted-foreground">
                      Score big with accurate tournament predictions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Fantasy Points</h4>
                    <p className="text-sm text-muted-foreground">
                      Players score based on real stats: points, rebounds, assists, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Bonus Multipliers</h4>
                    <p className="text-sm text-muted-foreground">
                      Cinderella picks and underdog performances earn extra points
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762860799648-0a957a2e51a6?w=800"
                  alt="Basketball game action"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              {/* Floating stat cards - hidden on mobile for cleaner look */}
              <Card className="hidden sm:block absolute top-8 -left-8 p-4 bg-card border-border shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Your Rank</p>
                    <p className="text-lg font-bold">#42</p>
                  </div>
                </div>
              </Card>
              <Card className="hidden sm:block absolute bottom-8 -right-8 p-4 bg-card border-border shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                    <p className="text-lg font-bold text-green-400">1,247</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Choose Your Game Plan
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              From casual fan to championship contender
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`p-6 sm:p-8 relative ${
                  tier.popular
                    ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20 md:scale-105'
                    : 'border-border'
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-purple-600 text-white border-0">
                    <Award className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold">{tier.price}</span>
                      {tier.price !== '$0' && (
                        <span className="text-muted-foreground">/tournament</span>
                      )}
                    </div>
                  </div>
                  <Button
                    className={
                      tier.popular
                        ? 'w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700'
                        : 'w-full'
                    }
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                  <div className="space-y-3">
                    {tier.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-600/10 to-pink-500/10" />
            <div className="relative p-8 sm:p-12 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Ready to Join the Madness?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                The tournament starts soon. Create your account now and get ready to compete.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:w-80 bg-background border-border h-12"
                />
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 px-8 h-12">
                  Start Playing Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Join 50,000+ players • Free forever option • Cancel anytime
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">BracketMadness</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate fantasy basketball tournament experience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Rules</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Responsible Gaming</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2026 BracketMadness. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}