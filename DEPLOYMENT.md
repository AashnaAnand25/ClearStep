# Deployment Guide for ClearStep

## Choose Your AI Provider

ClearStep supports three AI providers:

1. **Gemini (Google)** - **FREE tier available** - Recommended for hackathons
2. **OpenAI** - Paid (gpt-4o-mini is cost-effective)
3. **Ollama** - Free local option (requires local installation)

## Local Development with Gemini API (Free)

1. Get a free Gemini API key from https://makersuite.google.com/app/apikey
2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Gemini API key:
```
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp
```

4. Start the development server:
```bash
bun run dev
```

The app will now use real AI explanations instead of sample data.

## Local Development with OpenAI API (Paid)

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your OpenAI API key:
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

4. Start the development server:
```bash
bun run dev
```

## Vercel Deployment

### Prerequisites
- A Vercel account
- Your OpenAI API key (get one from https://platform.openai.com/api-keys)
- Node.js 22+ and Bun installed locally

### Step 1: Deploy to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your project:
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Confirm build settings (it should auto-detect from vercel.json)
- Set "Override Build Command" to: `bun run build`
- Set "Override Output Directory" to: `.output`

### Step 2: Configure Environment Variables

After deployment, you need to add your API key as an environment variable:

**For Gemini (Free):**
**Option A: Via Vercel Dashboard**
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `AI_PROVIDER`: `gemini`
   - `GEMINI_API_KEY`: Your actual Gemini API key
   - `GEMINI_MODEL`: `gemini-2.0-flash-exp`

**Option B: Via Vercel CLI**
```bash
vercel env add AI_PROVIDER production
# Enter: gemini

vercel env add GEMINI_API_KEY production
# Paste your API key when prompted

vercel env add GEMINI_MODEL production
# Enter: gemini-2.0-flash-exp
```

**For OpenAI (Paid):**
**Option A: Via Vercel Dashboard**
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `AI_PROVIDER`: `openai`
   - `OPENAI_API_KEY`: Your actual OpenAI API key
   - `OPENAI_MODEL`: `gpt-4o-mini`

**Option B: Via Vercel CLI**
```bash
vercel env add AI_PROVIDER production
# Enter: openai

vercel env add OPENAI_API_KEY production
# Paste your API key when prompted

vercel env add OPENAI_MODEL production
# Enter: gpt-4o-mini
```

### Step 3: Redeploy with Environment Variables

After adding environment variables, redeploy:
```bash
vercel --prod
```

### Step 4: Verify Deployment

1. Visit your deployed URL
2. Go through the intake flow
3. Try the explanation feature - it should now use real AI
4. Check that API endpoints work (no errors in browser console)

## Troubleshooting

### Build Fails on Vercel
- Ensure `bun` is available: Vercel may need `package.json` with `"engines": { "node": ">=22" }`
- Check that `bun.lock` is committed
- Try changing install command to `npm install` if Bun issues persist

### API Returns 403/429 Errors
- Verify your OpenAI API key has credits
- Check the key is set correctly in Vercel environment variables
- Ensure you're not exceeding rate limits (20 calls/minute per process)

### Static Assets Not Loading
- The build output includes both `.output/public` (static) and `.output/server` (Node)
- Vercel should serve from the Nitro output correctly
- Check vercel.json has correct `outputDirectory: ".output"`

### Environment Variables Not Working
- Variables must be added in Vercel dashboard, not in `.env` file
- `.env` is gitignored and won't be deployed
- Redeploy after adding variables: `vercel --prod`

## Alternative: Deploy with Node.js instead of Bun

If Vercel has issues with Bun, add to `package.json`:
```json
{
  "engines": {
    "node": ">=22.0.0"
  }
}
```

And change vercel.json install command:
```json
{
  "installCommand": "npm install"
}
```

## Cost Considerations

**Gemini (Recommended for Hackathons):**
- **FREE tier available** - 15 requests per day for Gemini 2.0 Flash
- No credit card required for the free tier
- Perfect for hackathon demos and testing

**OpenAI:**
- gpt-4o-mini is very cost-effective (~$0.15 per 1M input tokens)
- Requires a funded account
- The app has built-in rate limiting (20 calls/minute)
- Caching reduces repeated API calls
- Monitor usage in OpenAI dashboard

**General:**
- All providers have built-in rate limiting (20 calls/minute)
- Caching reduces repeated API calls (1-hour cache)
- Request size limited to 2KB to prevent abuse

## Security Notes

- ✅ API key is server-side only (never sent to browser)
- ✅ Request size limited to 2KB to prevent abuse
- ✅ Same-origin enforcement on API endpoints
- ✅ No tax documents or personal data sent to AI
- ✅ Structured output prevents prompt injection
- ⚠️ Never commit `.env` file
- ⚠️ Never share API keys in screenshots or demos
