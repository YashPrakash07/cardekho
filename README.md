# CarMatch: Confident Car Shortlisting Platform

CarMatch is a full-stack Next.js web application designed to help confused car buyers go from "I don't know what to buy" to "I am confident in my shortlist." It guides buyers through a visual onboarding quiz, calculates real-time match ratings, offers a side-by-side comparison board with highlighted attribute "winners," projects 5-year ownership costs, and acts as an automated "Confidence Advisor" highlighting pros, cons, and trade-offs.

---

## Run Instructions

### Prerequisites
- Node.js (version 18 or above recommended)
- npm (Node Package Manager)

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### Step 2: Start Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Build for Production (Optional)
To build and run the optimized production server:
```bash
npm run build
npm run start
```

---

## Brief Questions

### 1. What did you build and why? What did you deliberately cut?

#### What we built
We built a premium, glassmorphism-styled decision application featuring:
- **Visual Onboarding Quiz**: Replaces generic inputs with tactile, emoji-rich choice cards to gather budget, capacity, car style, fuel preferences, and priority sliders (Safety, Economy, Performance, Comfort).
- **Matchmaking Dashboard**: Renders results with dynamic circular match-score progress meters, spec badges, and filter options.
- **Full-Screen Comparison Matrix**: Displays specs side-by-side and automatically awards gold/emerald "Winner" badges (e.g. Lowest Price, Safest, Max Range, Fastest) across compared models.
- **5-Year Cost of Ownership (TCO) Calculator**: Projects 5-year fuel/charging expenses compared alongside purchase prices.
- **Confidence Advisor Report**: Generates custom warnings and success badges mapping the car's specifications against the user's priorities (e.g., highlighting seating capacity deficits, budget excesses, or efficiency alignment).
- **Shortlist Drawer & Note Taking**: Allows saving cars, writing custom reminders/notes, and persisting them in a local JSON database.
- **Shareable URL Shortlist**: Copies a clipboard URL containing shortlisted car IDs (e.g., `?shortlist=carmatch-001,carmatch-002`) that auto-loads, merges, and displays them on another user's device.

#### Why we built it
A major roadblock for buyers is spec-sheet overload. They see numbers (e.g., "7.1s 0-100 km/h", "520 L cargo") but don't know what they mean. The **Confidence Advisor** translates cold numbers into clear, personalized warnings or validations. The **TCO Calculator** highlights long-term economics (e.g. showing that an Electric SUV might save them $7,500 over a Petrol SUV despite a higher upfront price).

#### What we deliberately cut
- **Multi-page routing**: We structured the layout around reactive stateful overlays. This keeps transitions fast, removes page reload delays, and fits the single-session MVP focus.
- **External database setups**: We used Next.js API endpoints communicating with a local `db.json` file. This satisfies the full-stack persistence requirement without requiring database credentials or setup steps.
- **Live LLM API integration**: External LLM calls introduce API key setup requirements and high latency. We built a local rule-based Confidence Advisor that calculates spec alignment with zero latency and zero key requirements.

---

### 2. What’s your tech stack and why did you pick it?

- **Frontend & Backend**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Vanilla CSS (Custom Glassmorphism UI)
- **Storage**: Local JSON database (`db.json` read/written via Node `fs/promises` in Next.js Server Actions/APIs)

#### Why we picked it
Next.js allows us to build a full-stack app with React frontend code and backend API routes in a single codebase. Vanilla CSS was selected to build a premium custom UI (gradient backdrops, backdrop-filters, custom scrollbars, glowing borders) without Tailwind configuration overhead or layout limitations.

---

### 3. What did you delegate to AI tools vs. do manually?

#### Delegated to AI
- Generating the initial HTML layout scaffolding and boilerplate styling classes.
- Math calculators (TCO annual mileage projection math, percentages mapping, winner comparisons).
- Creating the automated browser test script inside the subagent to run UI regression checks.

#### Done Manually
- System architecture: designing the flow of states coordinating the Dashboard check boxes, bottom Compare Bar, Shortlist Drawer, and the full Comparison Board.
- URL Query parameter parsing and state merging logic in `page.tsx` (`useEffect` on load).
- Identifying compilation errors and correcting typos (e.g., resolving a React style syntax warning).

#### Where the tools helped most
The tools were extremely helpful for drafting CSS templates, writing type signatures, and generating UI cards quickly. The browser subagent excelled at running automated clicks and key inputs to check for regressions.

#### Where they got in the way
The AI tool generated a Tailwind-style keyword (`tracking: '0.05em'`) inside a React style object which threw a compilation error. We caught it during the typescript check and immediately corrected it to `letterSpacing: '0.05em'`.

---

### 4. If you had another 4 hours, what would you add?

1. **Loan & Lease Finance Widget**: Integrate down-payment, APR, and terms slider directly inside the TCO calculator to show monthly payments.
2. **Review Keywords Search & Sentiment Tagging**: Parse reviews text to let users search for terms like "quiet," "stiff," or "kids," and summarize sentiment.
3. **Multi-User Co-Shopper Voting**: Use WebSockets or a real-time database to let couples or family members vote on the same shortlist and leave notes together.
4. **Compare Radar Chart**: Embed a custom canvas-based Radar Chart overlaying Safety, Comfort, Performance, Economy, and Space visually.
