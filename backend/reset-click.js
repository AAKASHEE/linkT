// reset-clicks.js
// Run this script to reset all link clicks to 0 and analytics

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linktree';

console.log('🔄 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Link Schema (same as in server.js)
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

// Analytics Schema (same as in server.js)
const analyticsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

const resetAllData = async () => {
  try {
    console.log('🔄 Starting reset process...\n');
    
    // 1. Reset all link clicks to 0
    console.log('📊 Resetting link clicks...');
    const linkResult = await Link.updateMany(
      {}, // Empty filter = all documents
      {
        $set: {
          clicks: 0,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Reset ${linkResult.modifiedCount} links to 0 clicks`);
    
    // 2. Reset analytics
    console.log('📈 Resetting analytics...');
    const analyticsResult = await Analytics.updateMany(
      {}, // Reset all analytics documents
      {
        $set: {
          totalViews: 0,
          lastUpdated: new Date()
        }
      }
    );
    
    console.log(`✅ Reset ${analyticsResult.modifiedCount} analytics records`);
    
    // 3. Show current status
    console.log('\n📋 Current database status:');
    console.log('=' .repeat(50));
    
    const links = await Link.find().sort({ createdAt: 1 });
    console.log('\n🔗 Links:');
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   Type: ${link.type}`);
      console.log(`   Clicks: ${link.clicks} 🆕`);
      console.log(`   Gradient: ${link.gradient}`);
      console.log('');
    });
    
    const analytics = await Analytics.findOne();
    console.log('📊 Analytics:');
    if (analytics) {
      console.log(`   Total Views: ${analytics.totalViews} 🆕`);
      console.log(`   Last Updated: ${analytics.lastUpdated}`);
    } else {
      console.log('   No analytics data found');
    }
    
    console.log('\n🎉 SUCCESS! All data has been reset to zero.');
    console.log('🚀 Your LinkTree is now ready for fresh tracking!');
    console.log('\n💡 Tips:');
    console.log('   - Start your server: npm run dev');
    console.log('   - Visit your LinkTree to begin tracking new clicks');
    console.log('   - All clicks and views will now count from 0');
    
  } catch (error) {
    console.error('❌ Error during reset:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure MongoDB is running');
    console.log('   - Check your MONGODB_URI in .env file');
    console.log('   - Ensure database permissions are correct');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed.');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Process terminated. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the reset
console.log('🎯 LinkTree Click & Analytics Reset Tool');
console.log('=' .repeat(50));
resetAllData();