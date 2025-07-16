import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);
console.log('OPENAI_API_KEY first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10));
console.log('OPENAI_API_KEY last 10 chars:', process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 10));
