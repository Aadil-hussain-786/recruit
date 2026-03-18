# How to Restart Servers and Fix Job Creation

## Quick Fix (Recommended)

1. **Right-click** on `restart-servers.ps1`
2. Select **"Run with PowerShell"**
3. Wait 10-15 seconds for servers to start
4. Go to http://localhost:3000/jobs
5. Try creating a job

## Manual Fix (If script doesn't work)

### Step 1: Stop All Servers
- Close all terminal windows running `npm run dev`
- OR press `Ctrl+C` in each terminal

### Step 2: Start Backend
```bash
cd backend
npm run dev
```
Wait until you see "Server running on port 5000"

### Step 3: Start Frontend (in a NEW terminal)
```bash
cd frontend
npm run dev
```
Wait until you see "Ready on http://localhost:3000"

### Step 4: Clear Browser Cache
- Press `Ctrl+Shift+R` (or `Ctrl+F5`) to hard refresh
- Or clear browser cache completely

### Step 5: Test Job Creation
1. Go to http://localhost:3000/jobs
2. Click "New Job Posting"
3. Fill in Title and Description
4. Click "Publish Indexed Listing"
5. **It should work now!**

## What Was Fixed

1. ✅ Dashboard "Create Job" button now navigates to /jobs
2. ✅ Backend accepts both "PUBLISHED" and "published" status
3. ✅ Frontend shows detailed error messages
4. ✅ Auth middleware won't crash if organization is missing

## If Still Not Working

Open browser console (F12) and look for:
- The "Submitting job:" log (shows what's being sent)
- Any red error messages

Share those with me and I'll fix it immediately.
