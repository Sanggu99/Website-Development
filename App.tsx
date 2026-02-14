import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectView from './components/ProjectView';
import ProjectIndex from './components/ProjectIndex';
import AboutView from './components/AboutView';
import People from './components/People';
import Service from './components/Service';
import ContactSection from './components/ContactSection';
import Intro from './components/Intro';
import { projectsData } from './data';

import NewsIndex from './components/NewsIndex';
import NewsDetail from './components/NewsDetail';
import HomePopups from './components/HomePopups';
import RecentWorks from './components/RecentWorks';
import RecentWorkDetail from './components/RecentWorkDetail';
import { contentService } from './src/services/contentService';
import { newsData } from './newsData';
import VisualEditor from './src/adminv2/VisualEditor';
import AdminDashboard from './src/adminv2/AdminDashboard';
import ProjectManager from './src/adminv2/ProjectManager';
import PeopleManager from './src/adminv2/PeopleManager';
import PeopleEditor from './src/adminv2/PeopleEditor';
import NewsManager from './src/adminv2/NewsManager';
import NewsEditor from './src/adminv2/NewsEditor';
import RecentWorksManager from './src/adminv2/RecentWorksManager';
import RecentWorksEditor from './src/adminv2/RecentWorksEditor';

import CustomCursor from './components/CustomCursor';

type ViewState = 'home' | 'projects' | 'detail' | 'news' | 'recent-works' | 'recent-work-detail' | 'news-detail' | 'people' | 'service' | 'contact' | 'admin-v2' | 'admin-v2-editor' | 'admin-v2-manager' | 'people-manager' | 'people-editor' | 'news-manager' | 'news-editor' | 'recent-works-manager' | 'recent-works-editor';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [currentProjectId, setCurrentProjectId] = useState<number>(1);
  const [currentNewsId, setCurrentNewsId] = useState<number>(1);
  const [currentRecentWorkId, setCurrentRecentWorkId] = useState<string>('1');
  const [introKey, setIntroKey] = useState(0);

  // Initialize intro finish state based on hash to avoid showing it for specific pages
  const [isIntroFinished, setIsIntroFinished] = useState(() => {
    const hash = window.location.hash;
    return hash === '#/news' || hash === '#/recent-works' || hash.startsWith('#/recent-work/') || hash === '#/admin-v2' || hash.startsWith('#/admin-v2') || hash.startsWith('#/news/');
  });

  // Header Theme State for dynamic color control per section
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark' | undefined>(undefined);

  // Sync state with URL hash for back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#/about') {
        setView('home');
      } else if (hash === '#/works') {
        setView('projects');
      } else if (hash === '#/news') {
        setIsIntroFinished(true);
        setView('news');
      } else if (hash === '#/recent-works') {
        setIsIntroFinished(true);
        setView('recent-works');
      } else if (hash === '#/people') {
        setIsIntroFinished(true);
        setView('people');
      } else if (hash === '#/service') {
        setIsIntroFinished(true);
        setView('service');
      } else if (hash === '#/contact') {
        setIsIntroFinished(true);
        setView('contact');
      } else if (hash === '#/admin-v2' || hash === '#admin-v2' || hash === '#/admin-v2/') {
        setIsIntroFinished(true);
        setView('admin-v2');
      } else if (hash === '#/admin-v2/works/new') {
        setIsIntroFinished(true);
        setView('admin-v2-editor');
      } else if (hash.startsWith('#/admin-v2/works/') && hash !== '#/admin-v2/works/new') {
        setIsIntroFinished(true);
        setView('admin-v2-editor');
      } else if (hash === '#/admin-v2/works') {
        setIsIntroFinished(true);
        setView('admin-v2-manager');
      } else if (hash === '#/admin-v2/people') {
        setIsIntroFinished(true);
        setView('people-manager');
      } else if (hash === '#/admin-v2/people/new' || hash.startsWith('#/admin-v2/people/')) {
        setIsIntroFinished(true);
        setView('people-editor');
      } else if (hash === '#/admin-v2/news') {
        setIsIntroFinished(true);
        setView('news-manager');
      } else if (hash === '#/admin-v2/news/new') {
        setIsIntroFinished(true);
        setView('news-editor');
        setCurrentNewsId(0); // Reset for new
      } else if (hash.startsWith('#/admin-v2/news/')) {
        const id = parseInt(hash.replace('#/admin-v2/news/', ''), 10);
        if (!isNaN(id)) setCurrentNewsId(id);
        setIsIntroFinished(true);
        setView('news-editor');
      } else if (hash === '#/admin-v2/recent-works') {
        setIsIntroFinished(true);
        setView('recent-works-manager');
      } else if (hash.startsWith('#/admin-v2/recent-works/')) {
        setIsIntroFinished(true);
        setView('recent-works-editor');
      } else if (hash.startsWith('#/news/')) {
        const id = parseInt(hash.replace('#/news/', ''), 10);
        setIsIntroFinished(true);
        if (!isNaN(id)) {
          setCurrentNewsId(id);
          setView('news-detail');
        } else {
          setView('news');
        }
      } else if (hash.startsWith('#/recent-work/')) {
        const id = hash.replace('#/recent-work/', '');
        setIsIntroFinished(true);
        if (id) {
          setCurrentRecentWorkId(id);
          setView('recent-work-detail');
        } else {
          setView('recent-works');
        }
      } else if (hash.startsWith('#/project/')) {
        const id = parseInt(hash.replace('#/project/', ''), 10);
        if (!isNaN(id)) {
          setCurrentProjectId(id);
          setView('detail');
        } else {
          setView('home');
        }
      }
      window.scrollTo(0, 0);
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Reset header theme on view change
  useEffect(() => {
    setHeaderTheme(undefined);
  }, [view]);

  // Disable scrolling on Home View
  useEffect(() => {
    if (view === 'home' || view === 'recent-works') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [view]);

  const handleNavigateHome = () => {
    window.location.hash = '/about';
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newsViewMode, setNewsViewMode] = useState<'checkerboard' | 'list'>('checkerboard');

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNavigateToProjects = () => {
    window.location.hash = '/works';
  };

  const handleNavigateToProject = (id: number) => {
    window.location.hash = `/project/${id}`;
  };

  const handleIntroFinish = () => {
    setIsIntroFinished(true);
  };

  // Helper to handle generic navigation from Header
  const handleHeaderNavigate = (destination: 'home' | 'projects' | 'detail' | 'news' | 'recent-works' | 'people' | 'service' | 'contact', withIntro?: boolean) => {
    if (destination === 'home') {
      if (withIntro) {
        setIsIntroFinished(false);
        setIntroKey(prev => prev + 1);
      }
      handleNavigateHome();
    } else if (destination === 'projects') {
      handleNavigateToProjects();
    } else if (destination === 'news') {
      window.location.hash = '/news';
    } else if (destination === 'recent-works') {
      window.location.hash = '/recent-works';
    } else if (destination === 'people') {
      window.location.hash = '/people';
    } else if (destination === 'service') {
      window.location.hash = '/service';
    } else if (destination === 'contact') {
      window.location.hash = '/contact';
    } else {
      handleNavigateHome();
    }
  };

  const currentProject = contentService.getProjects().find(p => p.id === currentProjectId) || projectsData[0];
  const isDarkPage = view === 'home'; // Recent Works is now white bg, so not a dark page
  const isAdminView = view === 'admin-v2' || view === 'admin-v2-manager' || view === 'admin-v2-editor' || view === 'people-manager' || view === 'people-editor' || view === 'news-manager' || view === 'news-editor' || view === 'recent-works-manager' || view === 'recent-works-editor';

  // Toggle admin-mode class for cursor visibility
  useEffect(() => {
    if (isAdminView) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
    return () => document.body.classList.remove('admin-mode');
  }, [isAdminView]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-white relative">
      <CustomCursor isDark={isDarkPage} />

      {!isIntroFinished && <Intro onFinish={handleIntroFinish} key={introKey} />}

      {!isAdminView && (
        <Header
          onNavigate={handleHeaderNavigate}
          onNavigateProject={(id) => window.location.hash = `#/project/${id}`}
          onNavigateNews={(id) => window.location.hash = `#/news/${id}`}
          currentView={view as any}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          newsViewMode={newsViewMode}
          setNewsViewMode={setNewsViewMode}
          headerTheme={headerTheme}
        />
      )}

      <main className="flex-grow w-full">
        {view === 'home' && (
          <>
            <AboutView isIntroFinished={isIntroFinished} />
            <HomePopups />
          </>
        )}
        {view === 'people' && (
          <div className="min-h-screen bg-white">
            <People setHeaderTheme={setHeaderTheme} />
          </div>
        )}
        {view === 'service' && (
          <div className="min-h-screen bg-white">
            <Service />
          </div>
        )}
        {view === 'contact' && (
          <div className="min-h-screen w-full flex flex-col justify-center bg-white">
            <ContactSection />
          </div>
        )}
        {view === 'projects' && (
          <ProjectIndex
            onNavigate={handleNavigateToProject}
            selectedCategories={selectedCategories}
          />
        )}
        {view === 'detail' && (
          <ProjectView project={currentProject} />
        )}
        {view === 'news' && (
          <NewsIndex
            onNavigate={(id) => window.location.hash = `#/news/${id}`}
            viewMode={newsViewMode}
          />
        )}
        {view === 'news-detail' && (
          <NewsDetail item={contentService.getNews().find(n => n.id === currentNewsId) || newsData[0]} />
        )}
        {view === 'recent-works' && (
          <RecentWorks onNavigate={(id) => window.location.hash = `#/recent-work/${id}`} />
        )}
        {view === 'recent-work-detail' && (
          <RecentWorkDetail
            id={currentRecentWorkId}
            onBack={() => window.location.hash = '/recent-works'}
          />
        )}

        {/* Admin Routes */}
        {view === 'admin-v2' && <AdminDashboard />}
        {view === 'admin-v2-manager' && <ProjectManager />}
        {view === 'admin-v2-editor' && <VisualEditor />}

        {view === 'people-manager' && <PeopleManager />}
        {view === 'people-editor' && <PeopleEditor />}

        {view === 'news-manager' && <NewsManager />}
        {view === 'news-editor' && <NewsEditor id={currentNewsId || undefined} />}

        {view === 'recent-works-manager' && <RecentWorksManager />}
        {view === 'recent-works-editor' && <RecentWorksEditor />}
      </main>

      {!isAdminView && view !== 'recent-works' && <Footer />}
    </div>
  );
};

export default App;