const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testArbitraryKey() {
  const keys = ['abcdefg', 'AIzaSyFakeKey12345'];
  for (const key of keys) {
    try {
      console.log(`Testing key: ${key}`);
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent('Say hello');
      console.log('Success:', response.response.text());
    } catch (err) {
      console.log(`Error: ${err.message}\n`);
    }
  }
}

testArbitraryKey();
