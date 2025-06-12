// Load environment variables from .env
require('dotenv').config();

const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🚀 Attempting to connect to MongoDB...');

    // Debug: Show loaded URI
    console.log('🔍 MONGODB_URI from .env:', process.env.MONGODB_URI);

    // Use env URI or fallback if not defined
    const uri =
      process.env.MONGODB_URI ||
      'mongodb+srv://aakashpatra253:<yourPassword>@cluster01.lqbuqlv.mongodb.net/<yourDB>?retryWrites=true&w=majority';

    if (!uri || uri.includes('<yourPassword>')) {
      throw new Error('MONGODB_URI is missing or contains placeholder values.');
    }

    // Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('🧠 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);

    // Define a test schema + model
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.model('Test', testSchema);

    // Create and save a test doc
    const testDoc = new TestModel({
      message: 'Hello from LinkTree app!',
    });

    await testDoc.save();
    console.log('✅ Test document saved successfully!');

    // Delete the test doc
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');

    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
