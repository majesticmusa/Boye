import {hasResultVideo,hasCaptions} from './video-settings.mjs';

export function resultBridge(plan, available=hasResultVideo, captions=hasCaptions) {
 const sprint=plan==='sprint';
 const heading=sprint?'What happens after someone clicks?':'Which part of your funnel earns the next naira?';
 const example=sprint
  ? 'Imagine a patient sees a clinic’s teeth-cleaning post, taps through and lands on a general profile. They still have a question about their first visit, so they leave. A first-visit checklist gives them a reason to stay in touch. The clinic can then answer that question and send a booking link.'
  : 'Imagine two clinic ads bring in the same number of enquiries. One leads to twice as many booked visits. If the clinic tracks each ad through to booking, it can see which message deserves more budget and where the other journey needs work.';
 const next=sprint
  ? 'In the Foundation Sprint, we map that journey for your business, from the buyer’s first question to the offer you want them to take.'
  : 'In the 60-day system, we connect those steps, verify tracking and use a month of live campaign data to improve the journey.';
 const explanation='<p>'+example+'</p><p>'+next+'</p>';
 const track=captions?'<track kind="captions" src="/media/scorecard-vsl.en.vtt" srclang="en" label="English" default>':'';
 const body=available
  ? '<video controls playsinline preload="metadata" aria-label="Musa explains your marketing scorecard"><source src="/media/scorecard-vsl.mp4" type="video/mp4">'+track+'</video><details><summary>Read the short version</summary>'+explanation+'</details>'
  : explanation;
 return '<section class="sheet results-bridge" aria-labelledby="bridge-heading"><span class="tag">From score to action</span><h2 id="bridge-heading">'+heading+'</h2>'+body+'</section>';
}
