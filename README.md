# Andria Fitness

Lead magnet and free trial funnel for Andria Fitness, a strength and weight-loss studio.

**Flow:** landing page → free 4-week plan or 7-day free trial → thank-you page → email follow-up → paid program

Static HTML, CSS and JavaScript. No build step, so the folder can be deployed as it is (Vercel, Netlify or GitHub Pages).

## Pages

```
index.html        landing page: hero, quick facts, problem list, about and video, how we
                  help, free plan sign-up, how we train, how the free week works,
                  programs, fit check, reviews, FAQ, closing call to action
trial.html        7-day free trial sign-up
thank-you.html    thank-you page; ?type=plan shows the PDF download and a trial offer,
                  ?type=trial shows the booking details and the paid programs
program.html      programs, prices and comparison (the paid step)
legal.html        privacy, terms and health notice
emails/           follow-up email templates (see below)
lead-magnet/      source of the free plan PDF
assets/           styles, script, fonts (Barlow Condensed and Inter, SIL OFL), images and the PDF
```

## Email follow-up

Load these into your email tool (Mailchimp, Brevo, ConvertKit or similar). Merge tags are written as `{{first_name}}`; rename them to match your tool.

| When | Free plan sign-ups | Trial sign-ups |
| --- | --- | --- |
| Straight away | `plan-1-welcome.html` | `trial-1-confirm.html` |
| Day 2 | `plan-2-week1.html` | |
| Day 4 | `plan-3-food.html` | |
| Day 6 | `plan-4-trial.html` | `trial-2-offer.html` |

## Notes

- **Personal data is masked.** Contact email shows as `XXXX@XXXX.com`, phone as `+91 XXXXX XXXXX` and the street as `XXXX`. On the thank-you page the visitor's email shows as `XXXX@domain` and the phone keeps only the last 2 digits.
- **Form data.** Sign-ups are kept in the browser (sessionStorage) to fill in the thank-you page. To receive them, paste a form endpoint (Formspree, a Make or Zapier webhook, or your email tool's form URL) into `endpoint` at the top of `assets/site.js`.
- **Free plan PDF.** `assets/andria-4-week-starter-plan.pdf` is printed from `lead-magnet/plan.html` (A4, no margins, background graphics on). The cover image on the site is `assets/img/plan-cover.png`.
- **Photos.** The top photo is in `assets/img/hero-yoga.jpg`. The rest come from Pexels (free licence) and load from Pexels for now; download them into `assets/img` before launch.
- **Link previews.** Before launch, set `og:image` in `index.html` to the full https URL on the live domain and add `og:url`, so WhatsApp, Facebook and LinkedIn show the share image.
- **Online class video.** A YouTube video ("Why I teach free online Zoom yoga classes"), credited under the player. Swap it for the studio's own video when there is one (see the comment in `index.html`).
- **Prices, class sizes, batch timings and reviews are sample content.** Replace them with the studio's real details and real member reviews (with permission) before launch.

## Run locally

```
npx serve .
```

Then open http://localhost:3000.
