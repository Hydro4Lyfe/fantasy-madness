import React, { useState } from 'react';
import { BracketMadnessLanding } from '@/app/components/BracketMadnessLanding';
import { LoginPage } from '@/app/components/LoginPage';
import { SignupPage } from '@/app/components/SignupPage';
import { Dashboard } from '@/app/components/Dashboard';
import { GlobalContestPage } from '@/app/components/GlobalContestPage';
import { GlobalPicksPage } from '@/app/components/GlobalPicksPage';
import { SettingsPage } from '@/app/components/SettingsPage';
import { MyDraftsPage } from '@/app/components/MyDraftsPage';
import { MyContestsPage } from '@/app/components/MyContestsPage';
import { PublicDraftsPage } from '@/app/components/PublicDraftsPage';
import { DraftRoom } from '@/app/components/DraftRoom';
import { DraftDetails } from '@/app/components/DraftDetails';
import { ContestResults } from '@/app/components/ContestResults';
import { LeaderboardsPage } from '@/app/components/LeaderboardsPage';
import { HistoryPage } from '@/app/components/HistoryPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'global-contest' | 'global-picks' | 'settings' | 'my-drafts' | 'my-contests' | 'public-contests' | 'draft-details' | 'draft-room' | 'leaderboards' | 'contest-results' | 'history'>('landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'landing' | 'login' | 'signup' | 'dashboard' | 'global-contest' | 'global-picks' | 'settings' | 'my-drafts' | 'my-contests' | 'public-contests' | 'draft-details' | 'draft-room' | 'leaderboards' | 'contest-results' | 'history');
  };

  return (
    <>
      {currentPage === 'landing' && <BracketMadnessLanding onNavigate={handleNavigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <SignupPage onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'global-contest' && <GlobalContestPage onNavigate={handleNavigate} />}
      {currentPage === 'global-picks' && <GlobalPicksPage onNavigate={handleNavigate} />}
      {currentPage === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
      {currentPage === 'my-drafts' && <MyDraftsPage onNavigate={handleNavigate} />}
      {currentPage === 'my-contests' && <MyContestsPage onNavigate={handleNavigate} />}
      {currentPage === 'public-contests' && <PublicDraftsPage onNavigate={handleNavigate} />}
      {currentPage === 'draft-details' && <DraftDetails onNavigate={handleNavigate} />}
      {currentPage === 'draft-room' && <DraftRoom onNavigate={handleNavigate} />}
      {currentPage === 'leaderboards' && <LeaderboardsPage onNavigate={handleNavigate} />}
      {currentPage === 'contest-results' && <ContestResults onNavigate={handleNavigate} />}
      {currentPage === 'history' && <HistoryPage onNavigate={handleNavigate} />}
    </>
  );
}

export default App;