// server.js - Enhanced with Weekly Analytics
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linktree';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Make sure MongoDB is running locally or check your MONGODB_URI');
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// Link Schema
const linkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  gradient: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Link = mongoose.model('Link', linkSchema);

// Enhanced Analytics Schema
const analyticsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  dailyStats: [{
    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }],
  weeklyStats: [{
    weekStart: { type: Date },
    weekEnd: { type: Date },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 }
  }]
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

// Click Tracking Schema (for detailed tracking)
const clickTrackingSchema = new mongoose.Schema({
  linkId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  ip: String,
  referrer: String
});

const ClickTracking = mongoose.model('ClickTracking', clickTrackingSchema);

// View Tracking Schema
const viewTrackingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  ip: String,
  referrer: String
});

const ViewTracking = mongoose.model('ViewTracking', viewTrackingSchema);

// Helper Functions
const getWeekStart = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekEnd = (date = new Date()) => {
  const end = new Date(date);
  end.setDate(end.getDate() - end.getDay() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTodayEnd = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

// Initialize default data
const initializeData = async () => {
  try {
    const linkCount = await Link.countDocuments();
    if (linkCount === 0) {
      const defaultLinks = [
        {
          id: '1',
          title: 'My Portfolio Website',
          url: 'https://aakashe.vercel.app/',
          type: 'website',
          clicks: 0,
          gradient: 'from-blue-500 to-purple-600'
        },
        {
          id: '2',
          title: 'PHOTOGRAPHY',
          url: 'https://snapxdart.vercel.app/',
          type: 'social',
          clicks: 0,
          gradient: 'from-green-500 to-teal-600'
        },
        {
          id: '3',
          title: 'Follow on Instagram',
          url: 'https://www.instagram.com/aakaas.he/',
          type: 'social',
          clicks: 0,
          gradient: 'from-pink-500 to-orange-500'
        },
        {
          id: '4',
          title: 'Connect on LinkedIn',
          url: 'https://www.linkedin.com/in/aakashe/',
          type: 'social',
          clicks: 0,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          id: '5',
          title: 'GitHub Projects',
          url: 'https://github.com/AAKASHEE?tab=repositories',
          type: 'social',
          clicks: 0,
          gradient: 'from-gray-700 to-gray-900'
        },
        {
          id: '6',
          title: 'Twitter Updates',
          url: 'https://x.com/AAKASHEXX',
          type: 'social',
          clicks: 0,
          gradient: 'from-blue-400 to-blue-600'
        },
        {
          id: '7',
          title: 'Email Me',
          url: 'mailto:aakashe@example.com',
          type: 'contact',
          clicks: 0,
          gradient: 'from-red-500 to-pink-600'
        }
      ];

      await Link.insertMany(defaultLinks);
      console.log('Default links created successfully');
    }

    // Initialize analytics if not exists
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = new Analytics({
        totalViews: 0,
        totalClicks: 0,
        dailyStats: [],
        weeklyStats: []
      });
      await analytics.save();
      console.log('Analytics initialized');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Update weekly analytics helper
const updateWeeklyAnalytics = async () => {
  try {
    const analytics = await Analytics.findOne();
    if (!analytics) return;

    const currentWeekStart = getWeekStart();
    const currentWeekEnd = getWeekEnd();

    // Check if current week already exists
    const existingWeek = analytics.weeklyStats.find(week => 
      week.weekStart.getTime() === currentWeekStart.getTime()
    );

    if (!existingWeek) {
      // Get previous week's data for comparison
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekEnd = new Date(currentWeekEnd);
      previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

      // Count clicks and views for current week
      const weekClicks = await ClickTracking.countDocuments({
        timestamp: { $gte: currentWeekStart, $lte: currentWeekEnd }
      });

      const weekViews = await ViewTracking.countDocuments({
        timestamp: { $gte: currentWeekStart, $lte: currentWeekEnd }
      });

      const clickRate = weekViews > 0 ? ((weekClicks / weekViews) * 100).toFixed(2) : 0;

      // Add new week stats
      analytics.weeklyStats.push({
        weekStart: currentWeekStart,
        weekEnd: currentWeekEnd,
        views: weekViews,
        clicks: weekClicks,
        clickRate: parseFloat(clickRate)
      });

      // Keep only last 12 weeks
      if (analytics.weeklyStats.length > 12) {
        analytics.weeklyStats = analytics.weeklyStats.slice(-12);
      }

      await analytics.save();
      console.log('Weekly analytics updated');
    }
  } catch (error) {
    console.error('Error updating weekly analytics:', error);
  }
};

// Update daily analytics helper
const updateDailyAnalytics = async () => {
  try {
    const analytics = await Analytics.findOne();
    if (!analytics) return;

    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    // Check if today's stats already exist
    const existingDay = analytics.dailyStats.find(day => 
      day.date.toDateString() === todayStart.toDateString()
    );

    if (!existingDay) {
      const todayClicks = await ClickTracking.countDocuments({
        timestamp: { $gte: todayStart, $lte: todayEnd }
      });

      const todayViews = await ViewTracking.countDocuments({
        timestamp: { $gte: todayStart, $lte: todayEnd }
      });

      analytics.dailyStats.push({
        date: todayStart,
        views: todayViews,
        clicks: todayClicks
      });

      // Keep only last 30 days
      if (analytics.dailyStats.length > 30) {
        analytics.dailyStats = analytics.dailyStats.slice(-30);
      }

      await analytics.save();
    }
  } catch (error) {
    console.error('Error updating daily analytics:', error);
  }
};

// API Routes

// Get all links
app.get('/api/links', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: 1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Track page view
app.post('/api/track-view', async (req, res) => {
  try {
    const { userAgent, ip, referrer } = req.body;
    
    // Create view tracking record
    const viewTracking = new ViewTracking({
      userAgent: userAgent || req.get('User-Agent'),
      ip: ip || req.ip,
      referrer: referrer || req.get('Referrer')
    });
    await viewTracking.save();

    // Update analytics
    const analytics = await Analytics.findOne();
    if (analytics) {
      analytics.totalViews += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    }

    // Update daily analytics
    await updateDailyAnalytics();
    
    res.json({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Track link click
app.post('/api/track-click/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const { userAgent, ip, referrer } = req.body;

    // Update link click count
    const link = await Link.findOneAndUpdate(
      { id: linkId },
      { $inc: { clicks: 1 }, updatedAt: new Date() },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Create click tracking record
    const clickTracking = new ClickTracking({
      linkId,
      userAgent: userAgent || req.get('User-Agent'),
      ip: ip || req.ip,
      referrer: referrer || req.get('Referrer')
    });
    await clickTracking.save();

    // Update analytics
    const analytics = await Analytics.findOne();
    if (analytics) {
      analytics.totalClicks += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    }

    // Update daily analytics
    await updateDailyAnalytics();

    res.json({ 
      success: true, 
      message: 'Click tracked successfully',
      link: link
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Get analytics data
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await Analytics.findOne();
    const links = await Link.find().sort({ clicks: -1 });
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentClicks = await ClickTracking.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });
    
    const recentViews = await ViewTracking.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    // Calculate top performing links
    const topLinks = links.slice(0, 5).map(link => ({
      id: link.id,
      title: link.title,
      clicks: link.clicks,
      url: link.url
    }));

    // Calculate click rate
    const totalViews = analytics ? analytics.totalViews : 0;
    const totalClicks = analytics ? analytics.totalClicks : 0;
    const overallClickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

    res.json({
      totalViews: totalViews,
      totalClicks: totalClicks,
      overallClickRate: parseFloat(overallClickRate),
      recentViews: recentViews,
      recentClicks: recentClicks,
      topLinks: topLinks,
      dailyStats: analytics ? analytics.dailyStats.slice(-30) : [],
      weeklyStats: analytics ? analytics.weeklyStats.slice(-12) : [],
      linkStats: links.map(link => ({
        id: link.id,
        title: link.title,
        clicks: link.clicks,
        url: link.url,
        type: link.type
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get detailed link analytics
app.get('/api/analytics/link/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const link = await Link.findOne({ id: linkId });
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get click history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clickHistory = await ClickTracking.find({
      linkId: linkId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });

    // Group clicks by date
    const dailyClicks = {};
    clickHistory.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    });

    // Get recent clicks with details
    const recentClicks = await ClickTracking.find({ linkId: linkId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      link: {
        id: link.id,
        title: link.title,
        url: link.url,
        clicks: link.clicks,
        type: link.type,
        createdAt: link.createdAt
      },
      dailyClicks: dailyClicks,
      recentClicks: recentClicks,
      totalClicks: link.clicks
    });
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    res.status(500).json({ error: 'Failed to fetch link analytics' });
  }
});

// Create new link
app.post('/api/links', async (req, res) => {
  try {
    const { title, url, type, gradient } = req.body;
    
    if (!title || !url || !type) {
      return res.status(400).json({ error: 'Title, URL, and type are required' });
    }

    // Generate unique ID
    const linkCount = await Link.countDocuments();
    const id = (linkCount + 1).toString();

    const newLink = new Link({
      id,
      title,
      url,
      type,
      gradient: gradient || 'from-blue-500 to-purple-600',
      clicks: 0
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Update link
app.put('/api/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, type, gradient } = req.body;

    const updatedLink = await Link.findOneAndUpdate(
      { id },
      { 
        title,
        url,
        type,
        gradient,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
app.delete('/api/links/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLink = await Link.findOneAndDelete({ id });
    
    if (!deletedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Also delete associated click tracking data
    await ClickTracking.deleteMany({ linkId: id });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Weekly analytics update endpoint (can be called by cron job)
app.post('/api/analytics/update-weekly', async (req, res) => {
  try {
    await updateWeeklyAnalytics();
    res.json({ success: true, message: 'Weekly analytics updated successfully' });
  } catch (error) {
    console.error('Error updating weekly analytics:', error);
    res.status(500).json({ error: 'Failed to update weekly analytics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize data and start server
const startServer = async () => {
  try {
    await initializeData();
    
    // Update weekly analytics on startup
    await updateWeeklyAnalytics();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Analytics: http://localhost:${PORT}/api/analytics`);
    });
    
    // Schedule weekly analytics update (runs every day at midnight)
    setInterval(async () => {
      await updateWeeklyAnalytics();
      await updateDailyAnalytics();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();