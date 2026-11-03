# DKA: One Patient, Five Tables

A live classroom simulation for NUR 4206. Five tables each run one organ system for Jordan Reyes, 22, in severe DKA. No table sees the whole picture, so the class has to share cues to keep Jordan safe. The game runs on the hospital DKA/HHS Treatment Protocol (fluids by corrected sodium and potassium, Stage 1 and Stage 2 insulin titration, hypoglycemia management).

Live site: https://laurajobe.github.io/dkagame/

## Running a class

1. Open the site and choose **I'm the instructor**. Create a room. Click **Open projector view** for the classroom screen.
2. Each table opens the site on one device, chooses **Join a table**, enters the room code, and picks its table.
3. Each hour: tables set their orders and tap **Our table is ready**. Click **Run hour** on the dashboard when you are ready to move on.
4. Tables that want bicarbonate, intubation, or mannitol must **Call provider** with an SBAR. Approve or decline on the projector.
5. After each scene, click **End scene**, then start the next scene or go to the **Debrief**.

The **Instructor panel** shows the true values, resolution status, and the sick-day teaching checklist. Keep it hidden while projecting.

## Privacy

No student accounts, names, or emails. Devices sign in anonymously. Rooms are deleted after 24 hours. No analytics.

## One-time Firebase setup

1. Realtime Database → **Rules**: replace everything with the contents of `database.rules.json`, then **Publish**.
2. Authentication → Sign-in method: **Anonymous** enabled.

## Development

```
npm install
npm test          # physiology engine tests
npm run dev       # local dev server (real Firebase)
npm run mock      # local build with an in-browser stand-in database, for testing without Firebase
```

The physiology engine lives in `src/engine/` and has no dependency on React or Firebase. Per-hour effect sizes are in `src/engine/model.js`; scene starting values and event cards are in `src/engine/scenes.js`.

Pushing to `main` builds, tests, and deploys to GitHub Pages automatically.
