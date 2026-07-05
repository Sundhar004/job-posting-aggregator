const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (parts) {
        const key = parts[1];
        let val = parts[2] || '';
        // Remove surrounding quotes if any
        if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
          val = val.substring(1, val.length - 1);
        }
        if (val.length > 0 && val.charAt(0) === "'" && val.charAt(val.length - 1) === "'") {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn('Failed to parse .env.local:', e.message);
}

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');

async function testMongo() {
  console.log('--- Testing MongoDB Connection ---');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    return false;
  }
  console.log(`Connecting to: ${uri.replace(/:([^@]+)@/, ':****@')}`);
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected successfully!');
    // List databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(d => d.name));
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message);
    return false;
  }
}

async function testGemini() {
  console.log('\n--- Testing Gemini API ---');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('❌ GEMINI_API_KEY is not set in .env.local');
    return false;
  }
  console.log(`Using Key: ${key.substring(0, 10)}...`);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent('Say: "Hello World from Gemini!"');
    console.log('Gemini Response:', response.response.text().trim());
    console.log('✅ Gemini API Connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Gemini API Connection failed:', err.message);
    return false;
  }
}

async function testScraper() {
  console.log('\n--- Testing Scraper ---');
  const url = 'https://example.com';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('h1').text().trim();
    console.log(`Scraped Title from ${url}: "${title}"`);
    console.log('✅ Scraper working successfully!');
    return true;
  } catch (err) {
    console.error('❌ Scraper failed:', err.message);
    return false;
  }
}

async function runAll() {
  const mongoOk = await testMongo();
  const geminiOk = await testGemini();
  const scraperOk = await testScraper();
  
  console.log('\n=== Summary ===');
  console.log(`MongoDB: ${mongoOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Gemini:  ${geminiOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Scraper: ${scraperOk ? '✅ OK' : '❌ FAILED'}`);
  
  process.exit(mongoOk && geminiOk && scraperOk ? 0 : 1);
}

runAll();
