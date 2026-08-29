// Seeds the database with a bootstrap admin account and a few sample
// events/gallery images for "Sri Lakshmi Venkateswara Temple".
// Run with: npm run seed  (make sure .env / MONGO_URI is set first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const ensureAdminSeeded = require('./bootstrapAdmin');
const Event = require('./models/Event');
const GalleryImage = require('./models/GalleryImage');

async function seed() {
  await connectDB();

  await ensureAdminSeeded();

  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    const now = new Date();
    await Event.insertMany([
      {
        title: 'Sri Venkateswara Kalyanotsavam',
        description: 'Divine wedding celebration of Lord Venkateswara and Goddess Padmavathi.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        time: '9:00 AM - 12:00 PM',
        category: 'festival',
      },
      {
        title: 'Weekly Suprabhatam & Abhishekam',
        description: 'Early morning Suprabhatam followed by Abhishekam to the main deity.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        time: '6:00 AM - 7:30 AM',
        category: 'pooja',
      },
      {
        title: 'Annadanam Seva',
        description: 'Free community meal service, sponsored by devotee families.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        time: '12:00 PM - 2:00 PM',
        category: 'seva',
      },
    ]);
    console.log('Seeded sample events.');
  } else {
    console.log('Events already exist, skipping.');
  }

  const galleryCount = await GalleryImage.countDocuments();
  if (galleryCount === 0) {
    await GalleryImage.insertMany([
      {
        title: 'Main Temple Gopuram',
        imageUrl: '/images/gallery/gopuram.jpg',
        category: 'temple',
      },
      {
        title: 'Lord Venkateswara Sannidhi',
        imageUrl: '/images/gallery/sannidhi.jpg',
        category: 'deity',
      },
    ]);
    console.log('Seeded sample gallery images.');
  } else {
    console.log('Gallery images already exist, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
