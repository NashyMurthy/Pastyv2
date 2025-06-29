# Pastyv2

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/neo2wicked/Pastyv2)

# YouTube API Setup Guide

## 🎥 Setting up YouTube API Access

Before the app can process YouTube videos, you'll need to set up API access through Google Cloud Console. Follow these steps:

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it something memorable (like "video-processor")

3. Enable the YouTube Data API v3:
   - In the left sidebar, click "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

4. Create API Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your new API key will be displayed

5. Secure Your API Key (IMPORTANT):
   - Click on the newly created API key
   - Under "API restrictions", select "Restrict key"
   - Select "YouTube Data API v3" from the dropdown
   - Optionally: Add application restrictions (domain, IP, etc.)
   - Click "Save"

6. Add the API Key to Your Environment:
   ```bash
   # Contact your developer for instructions on where to add this key
   YOUTUBE_API_KEY=your_new_api_key_here
   ```

## ⚠️ Important Notes

- Keep your API key secret and never commit it to version control
- The free tier includes 10,000 units per day (about 100-1000 video requests)
- Monitor your usage in Google Cloud Console to avoid unexpected charges
- Consider setting up billing alerts if you enable billing

## 🚫 Common Issues

- If you see "quota exceeded" errors, you've hit the daily limit
- New projects may take a few minutes for API access to activate
- Some API features require billing to be enabled

## 📞 Need Help?

Contact your developer for assistance with integration. Do not share your API key in emails or public channels.