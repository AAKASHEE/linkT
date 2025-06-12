/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Github,
  Camera, 
  Mail, 
  Globe, 
  Eye, 
  Users, 
  TrendingUp,
  Settings,
  Palette,
  MousePointer,
  Calendar,
  Activity
} from 'lucide-react';

interface Link {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'website' | 'email' | 'phone';
  icon: React.ReactNode;
  clicks: number;
  gradient: string;
}

interface Analytics {
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  weeklyGrowth?: number;
  lastWeekClicks?: number;
}

interface WeeklyStats {
  currentWeek: number;
  lastWeek: number;
  growth: number;
  growthPercentage: number;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalClicks: 0,
    clickRate: 0
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    currentWeek: 0,
    lastWeek: 0,
    growth: 0,
    growthPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [clickAnimations, setClickAnimations] = useState<{[key: string]: boolean}>({});

  const profile = {
    name: "AAKASHE",
    bio: "Coder & Tech Enthusiast",
    avatar: "/img/PHOTO-2024-04-08-16-32-56.jpg",
    location: "Bengaluru, India"
  };

  // API Base URL - adjust this to your server URL
 const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


  const getIconForLink = (title: string, type: string): React.ReactNode => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('portfolio') || titleLower.includes('website')) {
      return <Globe className="w-5 h-5" />;
    } else if (titleLower.includes('photography') || titleLower.includes('camera')) {
      return <Camera className="w-5 h-5" />;
    } else if (titleLower.includes('instagram')) {
      return <Instagram className="w-5 h-5" />;
    } else if (titleLower.includes('linkedin')) {
      return <Linkedin className="w-5 h-5" />;
    } else if (titleLower.includes('github')) {
      return <Github className="w-5 h-5" />;
    } else if (titleLower.includes('twitter') || titleLower.includes('x.com')) {
      return <Twitter className="w-5 h-5" />;
    } else if (titleLower.includes('email') || titleLower.includes('mail')) {
      return <Mail className="w-5 h-5" />;
    } else if (type === 'social') {
      return <Users className="w-5 h-5" />;
    } else if (type === 'email') {
      return <Mail className="w-5 h-5" />;
    } else if (type === 'phone') {
      return <MousePointer className="w-5 h-5" />;
    }
    
    return <Globe className="w-5 h-5" />;
  };

  // Fetch links from API
  const fetchLinks = async () => {
    try {
      const response = await fetch(`${API_BASE}/links`);
      if (response.ok) {
        const data = await response.json();
        const linksWithIcons = data.map((link: any) => ({
          ...link,
          icon: getIconForLink(link.title, link.type),
          type: link.type as 'social' | 'website' | 'email' | 'phone'
        }));
        setLinks(linksWithIcons);
      } else {
        console.error('Failed to fetch links');
        setLinks(getDefaultLinks());
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      setLinks(getDefaultLinks());
    }
  };

  // Fetch analytics from API
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics({
          totalViews: data.totalViews || 0,
          totalClicks: data.totalClicks || 0,
          clickRate: data.overallClickRate || 0,
          weeklyGrowth: data.weeklyGrowth,
          lastWeekClicks: data.lastWeekClicks
        });
        
        calculateWeeklyGrowth(data.totalClicks || 0);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Calculate weekly growth
  const calculateWeeklyGrowth = (currentClicks: number) => {
    const lastWeekClicks = parseInt(localStorage.getItem('lastWeekClicks') || '0');
    const growth = currentClicks - lastWeekClicks;
    const growthPercentage = lastWeekClicks > 0 ? ((growth / lastWeekClicks) * 100) : 0;
    
    setWeeklyStats({
      currentWeek: currentClicks,
      lastWeek: lastWeekClicks,
      growth,
      growthPercentage
    });
  };

  // Track page view
  const trackPageView = async () => {
    try {
      await fetch(`${API_BASE}/track-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  // Track link click
  const trackLinkClick = async (linkId: string) => {
    try {
      setClickAnimations(prev => ({ ...prev, [linkId]: true }));
      setTimeout(() => {
        setClickAnimations(prev => ({ ...prev, [linkId]: false }));
      }, 600);

      const response = await fetch(`${API_BASE}/track-click/${linkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setLinks(prevLinks => 
          prevLinks.map(link => 
            link.id === linkId 
              ? { ...link, clicks: data.link.clicks }
              : link
          )
        );

        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  };

  // Handle link click
  const handleLinkClick = async (link: Link) => {
    await trackLinkClick(link.id);
    
    if (link.type === 'email') {
      window.location.href = link.url;
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get default links (fallback)
  const getDefaultLinks = (): Link[] => [
    {
      id: '1',
      title: 'My Portfolio Website',
      url: 'https://aakashe.vercel.app/',
      type: 'website',
      icon: <Globe className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: '2',
      title: 'PHOTOGRAPHY',
      url: 'https://snapxdart.vercel.app/',
      type: 'social',
      icon: <Camera className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: '3',
      title: 'Follow on Instagram',
      url: 'https://www.instagram.com/aakaas.he/',
      type: 'social',
      icon: <Instagram className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-pink-500 to-orange-500'
    },
    {
      id: '4',
      title: 'Connect on LinkedIn',
      url: 'https://www.linkedin.com/in/aakashe/',
      type: 'social',
      icon: <Linkedin className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      id: '5',
      title: 'GitHub Projects',
      url: 'https://github.com/AAKASHEE?tab=repositories',
      type: 'social',
      icon: <Github className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: '6',
      title: 'Twitter Updates',
      url: 'https://x.com/AAKASHEXX',
      type: 'social',
      icon: <Twitter className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: '7',
      title: 'Email Me',
      url: 'mailto:aakashpatar253@gmail.com',
      type: 'email',
      icon: <Mail className="w-5 h-5" />,
      clicks: 0,
      gradient: 'from-green-500 to-teal-600'
    },
  ];

  // Weekly stats update
  useEffect(() => {
    const updateWeeklyStats = () => {
      const currentClicks = analytics.totalClicks;
      localStorage.setItem('lastWeekClicks', currentClicks.toString());
      calculateWeeklyGrowth(currentClicks);
    };

    const lastUpdate = localStorage.getItem('lastWeeklyUpdate');
    const now = new Date();
    const currentWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    
    if (!lastUpdate || parseInt(lastUpdate) < currentWeek) {
      updateWeeklyStats();
      localStorage.setItem('lastWeeklyUpdate', currentWeek.toString());
    }

    const weeklyInterval = setInterval(updateWeeklyStats, 7 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(weeklyInterval);
  }, [analytics.totalClicks]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLinks(),
        fetchAnalytics(),
        trackPageView()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading your LinkTree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
              darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-white/50 hover:bg-white/70 text-gray-700'
              }`}
            >
              <Palette className="w-5 h-5" />
            </button>
            
            <button
              className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-white/50 hover:bg-white/70 text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Analytics Panel */}
        {showAnalytics && (
          <div className={`mb-8 p-6 rounded-2xl backdrop-blur-md transition-all duration-500 transform ${
            darkMode 
              ? 'bg-white/10 border border-white/20' 
              : 'bg-white/70 border border-white/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Live Analytics
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Real-time
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Eye className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {analytics.totalViews.toLocaleString()}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Views</div>
              </div>
              
              <div className="text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${
                  darkMode ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <MousePointer className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {analytics.totalClicks.toLocaleString()}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Clicks</div>
              </div>
              
              <div className="text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${
                  darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {analytics.clickRate.toFixed(1)}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rate</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Weekly Growth
                  </span>
                </div>
                <div className={`text-sm font-bold ${
                  weeklyStats.growth >= 0 
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {weeklyStats.growth >= 0 ? '+' : ''}{weeklyStats.growth} 
                  ({weeklyStats.growthPercentage >= 0 ? '+' : ''}{weeklyStats.growthPercentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/50 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {profile.name}
          </h1>
          <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {profile.bio}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            📍 {profile.location}
          </p>
        </div>

        {/* Enhanced Links Grid */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`group relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                clickAnimations[link.id] ? 'scale-95 animate-pulse' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${link.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
              
              <button
                className={`relative w-full p-6 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                    : 'bg-white/70 hover:bg-white/90 border border-white/50'
                } shadow-lg hover:shadow-xl`}
                onClick={() => handleLinkClick(link)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${link.gradient} text-white shadow-lg ${
                      clickAnimations[link.id] ? 'animate-bounce' : ''
                    }`}>
                      {link.icon}
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {link.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {link.clicks === 0 ? 'No clicks yet' : `${link.clicks.toLocaleString()} clicks`}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-600'
                  }`}>
                    →
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-12">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Made with 🖤 by AAKASHE
          </p>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Activity className={`w-3 h-3 ${darkMode ? 'text-green-400' : 'text-green-500'} animate-pulse`} />
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Live Tracking Active
            </span>
            <Activity className={`w-3 h-3 ${darkMode ? 'text-green-400' : 'text-green-500'} animate-pulse`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;