import React, { useState } from 'react';
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
  Palette
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
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const profile = {
    name: " AAKASHE",
    bio: "Coder & Tech Enthusiast",
    avatar: "/img/PHOTO-2024-04-08-16-32-56.jpg",
    location: "Bengaluru, India"
  };

  const links: Link[] = [
    {
      id: '1',
      title: 'My Portfolio Website',
      url: 'https://aakashe.vercel.app/',
      type: 'website',
      icon: <Globe className="w-5 h-5" />,
      clicks: 1247,
      gradient: 'from-blue-500 to-purple-600'
    },
     {
      id: '2',
      title: 'PHOTOGRAPHY',
      url: 'https://snapxdart.vercel.app/',
      type: 'social',
      icon: <Camera className="w-5 h-5" />,
      clicks: 189,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: '3',
      title: 'Follow on Instagram',
      url: 'https://www.instagram.com/aakaas.he/',
      type: 'social',
      icon: <Instagram className="w-5 h-5" />,
      clicks: 892,
      gradient: 'from-pink-500 to-orange-500'
    },
    {
      id: '4',
      title: 'Connect on LinkedIn',
      url: 'https://www.linkedin.com/in/aakashe/',
      type: 'social',
      icon: <Linkedin className="w-5 h-5" />,
      clicks: 654,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      id: '5',
      title: 'GitHub Projects',
      url: 'https://github.com/AAKASHEE?tab=repositories',
      type: 'social',
      icon: <Github className="w-5 h-5" />,
      clicks: 423,
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      id: '6',
      title: 'Twitter Updates',
      url: 'https://x.com/AAKASHEXX',
      type: 'social',
      icon: <Twitter className="w-5 h-5" />,
      clicks: 337,
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: '7',
      title: 'Email Me',
      url: 'mailto:aakashpatar253@gmail.com',
      type: 'email',
      icon: <Mail className="w-5 h-5" />,
      clicks: 189,
      gradient: 'from-green-500 to-teal-600'
    },
  ];

  const analytics: Analytics = {
    totalViews: 12847,
    totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
    clickRate: 28.7
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background Pattern */}
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

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className={`mb-8 p-6 rounded-2xl backdrop-blur-md transition-all duration-500 transform ${
            darkMode 
              ? 'bg-white/10 border border-white/20' 
              : 'bg-white/70 border border-white/50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Analytics Overview
            </h3>
            <div className="grid grid-cols-3 gap-4">
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
                  <Users className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
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
                  {analytics.clickRate}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rate</div>
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

        {/* Links Grid */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="group relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${link.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
              
              <button
                className={`relative w-full p-6 rounded-2xl backdrop-blur-md transition-all duration-300 ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                    : 'bg-white/70 hover:bg-white/90 border border-white/50'
                } shadow-lg hover:shadow-xl`}
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${link.gradient} text-white shadow-lg`}>
                      {link.icon}
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {link.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {link.clicks.toLocaleString()} clicks
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

        {/* Footer */}
        <div className="text-center mt-12">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Made with ❤️ using AAKASHE
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-white/30' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-white/30' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-white/30' : 'bg-gray-400'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;