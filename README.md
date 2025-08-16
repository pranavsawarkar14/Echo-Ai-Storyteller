# Echo - Your Personal AI Storyteller

## Deployment Guide

### Environment Variables

This project uses environment variables to manage configuration and API keys. For security reasons, these should never be committed to the repository.

#### Local Development

1. Create a `.env` file in the root directory with the following variables:
```
EXPO_PUBLIC_RORK_API_BASE_URL=your_rork_api_base_url
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
EXPO_PUBLIC_PEXELS_API_KEY=your_pexels_api_key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_BASE_URL=your_api_base_url
```

#### Vercel Deployment

When deploying to Vercel, add the environment variables in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add each of the variables listed above

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the build settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `web-build`
4. Add all required environment variables
5. Deploy!

### Troubleshooting

If you encounter a 404 error after deployment:
1. Check that all environment variables are correctly set in Vercel
2. Ensure the build completed successfully
3. Verify that the `vercel.json` file is in the root directory
4. Check Vercel deployment logs for any build errors
