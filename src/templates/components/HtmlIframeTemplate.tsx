import { openWhatsAppWithMessage } from '@/utils/whatsappRsvp';
import React, { useRef, useState, useEffect } from 'react';
import { TemplateProps } from '@/types/template';

interface HtmlIframeTemplateProps extends TemplateProps {
  htmlSrc: string;
  templateTitle?: string;
}

export const HtmlIframeTemplate: React.FC<HtmlIframeTemplateProps> = ({
  htmlSrc,
  templateTitle = 'Interactive Template',
  data,
  isLivePreview: _isLivePreview = false,
  onRsvpSubmit,
}) => {
  void _isLivePreview;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize editor updates with the iframe DOM where possible without mutating core animations
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const syncDom = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Synchronize dynamic script configurations (e.g. window.__TEMPO_EVENT_CONFIG)
        const win = iframe.contentWindow as any;
        if (win && win.__TEMPO_EVENT_CONFIG) {
          if (data?.title) win.__TEMPO_EVENT_CONFIG.title = data.title;
          if (data?.tagline) win.__TEMPO_EVENT_CONFIG.script = data.tagline;
          if (data?.venue) win.__TEMPO_EVENT_CONFIG.venue = data.venue;
          if (data?.address) win.__TEMPO_EVENT_CONFIG.addr = data.address;
          if (data?.date) win.__TEMPO_EVENT_CONFIG.date = data.date;
          if ((data?.rsvpSettings as any)?.phone) win.__TEMPO_EVENT_CONFIG.phone = (data.rsvpSettings as any).phone;
          if (typeof win.applyConfigToDom === 'function') {
            win.applyConfigToDom(win.__TEMPO_EVENT_CONFIG);
          }
        }

        // Determine template type early
        const isPortfolioTemplate =
          data?.eventType?.toLowerCase() === 'portfolio' ||
          (data as any)?.category === 'portfolio' ||
          templateTitle?.toLowerCase().includes('portfolio') ||
          htmlSrc?.includes('portfolio');

        // Non-portfolio generic replacements (invitations, RSVP cards, etc.) - ONLY when NOT using Studio Editor defaultTexts
        if (!isPortfolioTemplate && !data?.portfolioData?.defaultTexts) {
          // 1. Title / Celebrant Name
          if (data?.title) {
            const titleEls = doc.querySelectorAll('h1, .event-title, #event-title, .celebrant-name, [data-field="title"], [data-k="title"]');
            titleEls.forEach((el) => {
              if (data.title !== 'Untitled Event') {
                el.textContent = data.title;
              }
            });
            if (doc.title) {
              doc.title = data.title;
            }
          }

          // 2. Tagline / Subtitle
          if (data?.tagline) {
            const taglineEls = doc.querySelectorAll('.event-tagline, #event-tagline, .subheadline, [data-field="tagline"], [data-k="script"]');
            taglineEls.forEach((el) => {
              el.textContent = data.tagline;
            });
          }

          // 3. Date
          if (data?.date) {
            const dateEls = doc.querySelectorAll('.event-date, #event-date, .date, [data-field="date"], [data-k="hdate"], [data-k="ddate"]');
            dateEls.forEach((el) => {
              el.textContent = data.date;
            });
          }

          // 4. Time
          if (data?.time) {
            const timeEls = doc.querySelectorAll('.event-time, #event-time, .time, [data-field="time"], [data-k="dtime"]');
            timeEls.forEach((el) => {
              el.textContent = data.time;
            });
          }

          // 5. Venue & Address
          if (data?.venue) {
            const venueEls = doc.querySelectorAll('.event-venue, #event-venue, .venue, [data-field="venue"], [data-k="venue"]');
            venueEls.forEach((el) => {
              el.textContent = data.venue;
            });
          }
          if (data?.address) {
            const addrEls = doc.querySelectorAll('.event-address, #event-address, .address, [data-field="address"], [data-k="addr"]');
            addrEls.forEach((el) => {
              el.textContent = data.address;
            });
          }

          // 6. Note / Description / Host
          if (data?.note) {
            const noteEls = doc.querySelectorAll('.event-note, #event-note, .note, [data-field="note"], [data-k="host"]');
            noteEls.forEach((el) => {
              el.textContent = data.note;
            });
          }

          // 7. Cover / Polaroid Photo
          if (data?.photos && data.photos.length > 0 && data.photos[0].url) {
            const photoEls = doc.querySelectorAll('img.hero-photo, img.polaroid-img, img.cover-photo, img.main-photo, img#ph, [data-field="photo"]');
            photoEls.forEach((el) => {
              (el as HTMLImageElement).src = data.photos[0].url;
            });
          }
        }

        // 8. Stitch Minimal Real-Time Live Sync (For ALL 13 Portfolio & Birthday Templates)
        if (data?.portfolioData || data?.title) {
          const pf = data.portfolioData;
          const dt = pf?.defaultTexts || {};
          void pf;

          // Inject visual editing indicators stylesheet for live canvas interaction
          let styleEl = doc.getElementById('tempo-canvas-editor-indicators') as HTMLStyleElement | null;
          if (!styleEl && doc.head) {
            styleEl = doc.createElement('style');
            styleEl.id = 'tempo-canvas-editor-indicators';
            styleEl.textContent = `
              [data-sync-key] {
                cursor: text !important;
                transition: outline 0.12s ease-out, box-shadow 0.12s ease-out, background-color 0.12s ease-out !important;
              }
              [data-sync-key]:hover {
                outline: 1.5px dashed #10b981 !important;
                outline-offset: 3px !important;
                background-color: rgba(16, 185, 129, 0.08) !important;
              }
              [data-sync-key]:focus {
                outline: 2px solid #10b981 !important;
                outline-offset: 3px !important;
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25) !important;
                background-color: rgba(16, 185, 129, 0.12) !important;
              }
            `;
            doc.head.appendChild(styleEl);
          }

          // Helper for bidirectional synchronization of editable site canvas elements
          const bindSyncKey = (
            target: Element | string | null | undefined,
            key: string,
            val: string | undefined
          ) => {
            if (!key) return;
            const elements: HTMLElement[] = [];

            if (target && typeof target === 'object' && target instanceof HTMLElement) {
              elements.push(target);
            } else {
              const explicitEls = doc.querySelectorAll<HTMLElement>(`[data-sync-key="${key}"]`);
              explicitEls.forEach((el) => elements.push(el));
              if (target && typeof target === 'string') {
                try {
                  const targetEls = doc.querySelectorAll<HTMLElement>(target);
                  targetEls.forEach((el) => {
                    if (!elements.includes(el)) elements.push(el);
                  });
                } catch {
                  // Ignore invalid selector queries
                }
              }
            }

            if (elements.length === 0) return;

            elements.forEach((el) => {
              el.setAttribute('data-sync-key', key);
              el.setAttribute('title', 'Click to edit text');

              // Avoid jumping cursor if the user is currently typing in this element on the canvas
              if (doc.activeElement !== el && val !== undefined) {
                if (key === 'slide1Word' || key === 'slide2Word') {
                  const letters = [...val].map((c, j) => `<b style="--i:${j}">${c}</b>`).join('');
                  if (el.innerHTML !== letters) {
                    el.innerHTML = letters;
                  }
                } else if (key === 'heroTitle' && htmlSrc?.includes('3d-in-motion')) {
                  const cleanHeading = val.trim();
                  const parts = cleanHeading.split(/\s+/);
                  if (parts.length > 1) {
                    const mid = Math.ceil(parts.length / 2);
                    el.innerHTML = `<span>${parts.slice(0, mid).join(' ')}</span> <span>${parts.slice(mid).join(' ')}</span>`;
                  } else if (cleanHeading) {
                    el.innerHTML = `<span>${cleanHeading}</span>`;
                  } else {
                    el.innerHTML = '';
                  }
                } else if (key === 'heroTitle' && htmlSrc?.includes('motion-designer')) {
                  const cleanHeading = val.trim();
                  const parts = cleanHeading.split(/\s+/);
                  if (parts.length > 1) {
                    const mid = Math.ceil(parts.length / 2);
                    el.innerHTML = `${parts.slice(0, mid).join(' ')}<br>${parts.slice(mid).join(' ')}`;
                  } else {
                    el.textContent = cleanHeading;
                  }
                } else if (key === 'heroTitle' && htmlSrc?.includes('janamdin-mubarak')) {
                  const words = val.trim().split(/\s+/);
                  if (words.length > 1) {
                    el.innerHTML = words.map((w) => `<span>${w}</span>`).join('');
                  } else {
                    el.textContent = val;
                  }
                } else if (key === 'heroGreeting' && htmlSrc?.includes('alex-3d')) {
                  el.innerHTML = val.includes('\n') ? val.replace(/\n/g, '<br class="mb"> ') : val;
                } else if (key === 'designerName' && htmlSrc?.includes('alex-3d')) {
                  el.innerHTML = val.includes('\n') ? val.replace(/\n/g, '<br>') : val.replace(/\s+/, '<br>');
                } else if (key.startsWith('work') && htmlSrc?.includes('3d-in-motion')) {
                  el.setAttribute('data-t', val);
                  el.title = val;
                } else if (val.includes('\n')) {
                  el.innerHTML = val.replace(/\n/g, '<br>');
                } else {
                  if (el.textContent !== val) {
                    el.textContent = val;
                  }
                }
              }

              // Bind click-to-edit and real-time live input dispatch once
              if (!el.getAttribute('data-editable-bound')) {
                el.setAttribute('data-editable-bound', 'true');
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('spellcheck', 'false');

                // Prevent link navigation on click so user can edit link text
                el.addEventListener('click', (e) => {
                  if (el.tagName === 'A' || el.closest('a')) {
                    e.preventDefault();
                  }
                });

                const sendInlineUpdate = () => {
                  const liveText = el.innerText !== undefined ? el.innerText.trim() : (el.textContent || '').trim();
                  try {
                    window.parent.postMessage(
                      {
                        type: 'TEMPO_CANVAS_INLINE_EDIT',
                        key,
                        value: liveText,
                      },
                      '*'
                    );
                  } catch (err) {
                    console.debug('Failed to postMessage:', err);
                  }
                };

                el.addEventListener('input', sendInlineUpdate);
                el.addEventListener('blur', sendInlineUpdate);
              }
            });
          };

          // A. Hero Avatar Image / 3D Figurine (Prevent cross-site image leakage)
          if (pf?.customAvatarUrl) {
            if (htmlSrc?.includes('web-developer')) {
              doc.querySelectorAll('img.char').forEach((el) => {
                (el as HTMLImageElement).src = pf.customAvatarUrl!;
              });
            } else if (htmlSrc?.includes('alex-3d')) {
              doc.querySelectorAll('img.face').forEach((el) => {
                (el as HTMLImageElement).src = pf.customAvatarUrl!;
              });
            } else if (htmlSrc?.includes('design-gallery')) {
              doc.querySelectorAll('img.avatar').forEach((el) => {
                (el as HTMLImageElement).src = pf.customAvatarUrl!;
              });
            } else if (htmlSrc?.includes('3d-in-motion')) {
              doc.querySelectorAll('img.dino').forEach((el) => {
                (el as HTMLImageElement).src = pf.customAvatarUrl!;
              });
            }
          }

          if (htmlSrc?.includes('web-developer') && pf?.card1?.characterImage) {
            const charEls = doc.querySelectorAll('img.char');
            charEls.forEach((el) => {
              (el as HTMLImageElement).src = pf.card1!.characterImage!;
            });
          }

          // B. Template-Specific Bindings for ALL 6 Templates
          // 1) 3D in Motion Portfolio
          if (htmlSrc?.includes('3d-in-motion')) {
            bindSyncKey('a.logo, header .logo', 'brandName', dt.brandName);

            const navLinks = doc.querySelectorAll('#nav a, ul.nav a, header nav a');
            if (navLinks[0]) bindSyncKey(navLinks[0], 'navWork', dt.navWork);
            if (navLinks[1]) bindSyncKey(navLinks[1], 'navAbout', dt.navAbout);
            if (navLinks[2]) bindSyncKey(navLinks[2], 'navServices', dt.navServices);
            if (navLinks[3]) bindSyncKey(navLinks[3], 'navContact', dt.navContact);

            bindSyncKey('.meta span:first-child, .hero .meta span:first-child', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('.meta span:last-child, .hero .meta span:last-child', 'heroYearTag', dt.heroYearTag);
            bindSyncKey('h1#h1, h1.ht, .hero h1', 'heroTitle', dt.heroTitle);

            bindSyncKey('.cta a.btn.p, .cta a:first-child, .hero a[href="#work"]', 'btnViewWork', dt.btnViewWork);
            bindSyncKey('.cta a.btn.s, .cta a:last-child, .hero a[href="#contact"]', 'btnContact', dt.btnContact);

            bindSyncKey('#wh, #work .h2, #work h2', 'selectedWorkHeading', dt.selectedWorkHeading);
            bindSyncKey('#work .cnt, .hdr .cnt, #work span.cnt', 'tapToEnlargeHint', dt.tapToEnlargeHint);

            const workCards = doc.querySelectorAll('#work button.card, .grid.work button.card');
            if (workCards[0]) bindSyncKey(workCards[0], 'work1', dt.work1);
            if (workCards[1]) bindSyncKey(workCards[1], 'work2', dt.work2);
            if (workCards[2]) bindSyncKey(workCards[2], 'work3', dt.work3);
            if (workCards[3]) bindSyncKey(workCards[3], 'work4', dt.work4);
            if (workCards[4]) bindSyncKey(workCards[4], 'work5', dt.work5);
            if (workCards[5]) bindSyncKey(workCards[5], 'work6', dt.work6);

            bindSyncKey('#about p, .about p, section#about p', 'aboutText', dt.aboutText);

            bindSyncKey('#sh, #services .h2, #services h2', 'servicesHeading', dt.servicesHeading);
            const svcItems = doc.querySelectorAll('.svc article.sv, #services .sv, #services article');
            if (svcItems[0]) {
              bindSyncKey(svcItems[0].querySelector('h3'), 'service1Title', dt.service1Title);
              bindSyncKey(svcItems[0].querySelector('p'), 'service1Desc', dt.service1Desc);
            }
            if (svcItems[1]) {
              bindSyncKey(svcItems[1].querySelector('h3'), 'service2Title', dt.service2Title);
              bindSyncKey(svcItems[1].querySelector('p'), 'service2Desc', dt.service2Desc);
            }
            if (svcItems[2]) {
              bindSyncKey(svcItems[2].querySelector('h3'), 'service3Title', dt.service3Title);
              bindSyncKey(svcItems[2].querySelector('p'), 'service3Desc', dt.service3Desc);
            }

            bindSyncKey('#ch, #contact h2.big, #contact h2', 'contactHeading', dt.contactHeading);
            const mailEl = doc.querySelector('#mail, a.mail, #contact a.mail') as HTMLAnchorElement | null;
            if (mailEl) {
              bindSyncKey(mailEl, 'contactEmail', dt.contactEmail);
              if (dt.contactEmail) mailEl.href = `mailto:${dt.contactEmail}`;
            }
            bindSyncKey('#copy, button#copy, #contact button#copy', 'copyEmailBtn', dt.copyEmailBtn);
            bindSyncKey('footer span', 'footerCopyright', dt.footerCopyright);
            bindSyncKey('footer a', 'backToTop', dt.backToTop);
          }

          // 2) 2022 Design Gallery Portfolio
          if (htmlSrc?.includes('design-gallery')) {
            bindSyncKey('.bar .chip b, .chip b', 'headerDate', dt.headerDate);
            bindSyncKey('.bar .col, .col', 'collectionBadge', dt.collectionBadge);
            bindSyncKey('.copy h2 .gal, .gal', 'heroGallery', dt.heroGallery);
            bindSyncKey('.copy .pf span:first-child', 'heroPort', dt.heroPort);
            bindSyncKey('.copy .pf .ring, .pf .ring', 'heroFolio', dt.heroFolio);
            bindSyncKey('.copy .pf .tag, .pf .tag', 'brandBadge', dt.brandBadge);
            bindSyncKey('.copy .pill span:first-child, .pill span:first-child', 'positionLabel', dt.positionLabel);
            bindSyncKey('.copy .pill .g, .pill .g', 'positionValue', dt.positionValue);
            bindSyncKey('.stk, .stk.abs', 'hireSticker', dt.hireSticker);
            bindSyncKey('h2.q, #contact h2.q', 'awaitingCall', dt.awaitingCall);
            bindSyncKey('.at, div.at', 'thanksNotice', dt.thanksNotice);
            bindSyncKey('p.small, #contact p.small', 'interviewNote', dt.interviewNote);
            bindSyncKey('.fill, span.fill', 'effortTag', dt.effortTag);
            bindSyncKey('.big .a', 'thankYou', dt.thankYou);
            bindSyncKey('.bar .legal, .legal', 'copyright', dt.copyright);

            bindSyncKey('.foot .wa a.btn, .wa a.btn', 'whatsappLabel', dt.whatsappLabel);
            bindSyncKey('.boxes a[href*="wa.me"], a[href*="wa.me"]', 'whatsappNumber', dt.whatsappNumber);
            bindSyncKey('.boxes a[href^="mailto:"], a[href^="mailto:"]', 'emailAddress', dt.emailAddress);
          }

          // 3) EMIWAY Minecraft Creator Portfolio
          if (htmlSrc?.includes('emiway')) {
            bindSyncKey('a[href="#top"].font-pixel, footer span.font-pixel, .brand', 'brandName', dt.brandName);

            const navLinks = doc.querySelectorAll('nav[aria-label="Main"] a, nav a');
            if (navLinks[0]) bindSyncKey(navLinks[0], 'navAbout', dt.navAbout);
            if (navLinks[1]) bindSyncKey(navLinks[1], 'navWorld', dt.navWorld);
            if (navLinks[2]) bindSyncKey(navLinks[2], 'navGameplay', dt.navGameplay);
            if (navLinks[3]) bindSyncKey(navLinks[3], 'navAchievements', dt.navAchievements);
            if (navLinks[4]) bindSyncKey(navLinks[4], 'navContact', dt.navContact);

            bindSyncKey('#top h1, h1.font-pixel, h1', 'heroName', dt.heroName);
            bindSyncKey('#top p.text-stone, .hero p, p.text-stone', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('#top a[href="#world"], a[href="#world"]', 'btnExploreWorld', dt.btnExploreWorld);
            bindSyncKey('#top a[href="#gameplay"], a[href="#gameplay"]', 'btnWatchGameplay', dt.btnWatchGameplay);

            bindSyncKey('#about h2, section#about h2', 'aboutHeading', dt.aboutHeading);
            bindSyncKey('#about p.text-stone, #about p', 'aboutBio', dt.aboutBio);

            const skills = doc.querySelectorAll('#skills ul li p, #skills li p, #skills p');
            if (skills[0]) bindSyncKey(skills[0], 'skill1', dt.skill1);
            if (skills[1]) bindSyncKey(skills[1], 'skill2', dt.skill2);
            if (skills[2]) bindSyncKey(skills[2], 'skill3', dt.skill3);
            if (skills[3]) bindSyncKey(skills[3], 'skill4', dt.skill4);

            bindSyncKey('#world h2, section#world h2', 'worldHeading', dt.worldHeading);
            const biomes = doc.querySelectorAll('#world ul li span, #world li span');
            if (biomes[0]) bindSyncKey(biomes[0], 'biome1', dt.biome1);
            if (biomes[1]) bindSyncKey(biomes[1], 'biome2', dt.biome2);
            if (biomes[2]) bindSyncKey(biomes[2], 'biome3', dt.biome3);

            bindSyncKey('#gameplay h2, section#gameplay h2', 'gameplayHeading', dt.gameplayHeading);
            bindSyncKey('#gameplay a:first-of-type span:last-child', 'gameplayFeatured', dt.gameplayFeatured);
            const subVideos = doc.querySelectorAll('#gameplay div.grid a span:last-child');
            if (subVideos[0]) bindSyncKey(subVideos[0], 'videoTitle', dt.videoTitle);

            bindSyncKey('#achievements h2, section#achievements h2', 'achievementsHeading', dt.achievementsHeading);
            const achieveCards = doc.querySelectorAll('#achievements ul li');
            if (achieveCards[0]) {
              bindSyncKey(achieveCards[0].querySelector('span.text-white'), 'achievement1', dt.achievement1);
              bindSyncKey(achieveCards[0].querySelector('span.text-stone'), 'addYoursPrompt', dt.addYoursPrompt);
            }

            bindSyncKey('#contact h2, section#contact h2', 'communityHeading', dt.communityHeading);
          }

          // 4) Alex 3D Designer Portfolio
          if (htmlSrc?.includes('alex-3d')) {
            const navLinks = doc.querySelectorAll('nav a');
            if (navLinks[0]) bindSyncKey(navLinks[0], 'navAbout', dt.navAbout);
            if (navLinks[1]) bindSyncKey(navLinks[1], 'navCustomers', dt.navCustomers);
            if (navLinks[2]) bindSyncKey(navLinks[2], 'navProjects', dt.navProjects);
            if (navLinks[3]) bindSyncKey(navLinks[3], 'navContact', dt.navContact);

            bindSyncKey('#hs, h1#ht span#hs', 'heroGreeting', dt.heroGreeting);
            bindSyncKey('.hero-in p, .hero p', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('.hero-in a.pill, .hero a.pill', 'btnContact', dt.btnContact);

            bindSyncKey('#about h2, section.about h2', 'aboutHeading', dt.aboutHeading);
            bindSyncKey('#about p:first-of-type, .about p:first-of-type', 'aboutBio', dt.aboutBio);
            bindSyncKey('#about p:nth-of-type(2), .about p:nth-of-type(2)', 'aboutCallout', dt.aboutCallout);
            bindSyncKey('#about a.pill, .about a.pill', 'aboutCta', dt.aboutCta);

            bindSyncKey('#services h2, section.svc h2', 'servicesHeading', dt.servicesHeading);
            const svcRows = doc.querySelectorAll('.svc .row, #services .row');
            if (svcRows[0]) {
              bindSyncKey(svcRows[0].querySelector('h3'), 'service1Title', dt.service1Title);
              bindSyncKey(svcRows[0].querySelector('p'), 'service1Desc', dt.service1Desc);
            }
            if (svcRows[1]) {
              bindSyncKey(svcRows[1].querySelector('h3'), 'service2Title', dt.service2Title);
              bindSyncKey(svcRows[1].querySelector('p'), 'service2Desc', dt.service2Desc);
            }
            if (svcRows[2]) {
              bindSyncKey(svcRows[2].querySelector('h3'), 'service3Title', dt.service3Title);
              bindSyncKey(svcRows[2].querySelector('p'), 'service3Desc', dt.service3Desc);
            }
            if (svcRows[3]) {
              bindSyncKey(svcRows[3].querySelector('h3'), 'service4Title', dt.service4Title);
              bindSyncKey(svcRows[3].querySelector('p'), 'service4Desc', dt.service4Desc);
            }
            if (svcRows[4]) {
              bindSyncKey(svcRows[4].querySelector('h3'), 'service5Title', dt.service5Title);
              bindSyncKey(svcRows[4].querySelector('p'), 'service5Desc', dt.service5Desc);
            }

            bindSyncKey('#projects h2, section.proj h2', 'projectsHeading', dt.projectsHeading);
            const projectCards = doc.querySelectorAll('#projects article.card, .proj .card');
            if (projectCards[0]) bindSyncKey(projectCards[0].querySelector('em'), 'project1Client', dt.project1Client);
            if (projectCards[1]) bindSyncKey(projectCards[1].querySelector('em'), 'project2Client', dt.project2Client);
            if (projectCards[2]) bindSyncKey(projectCards[2].querySelector('em'), 'project3Client', dt.project3Client);

            bindSyncKey('section.tst h2, .tst h2', 'testimonialsHeading', dt.testimonialsHeading);
            bindSyncKey('#contact h2, section.ct h2', 'contactHeading', dt.contactHeading);
            bindSyncKey('#contact a.m, .ct a.m', 'contactEmail', dt.contactEmail);
            bindSyncKey('footer h3.h, footer h3', 'designerName', dt.designerName);
          }

          // 5) Motion Graphics Designer Portfolio
          if (htmlSrc?.includes('motion-designer')) {
            bindSyncKey('#hd a.logo, a.logo', 'brandName', dt.brandName);

            const navLinks = doc.querySelectorAll('#menu a, #nav a, nav a');
            if (navLinks[0]) bindSyncKey(navLinks[0], 'navWork', dt.navWork);
            if (navLinks[1]) bindSyncKey(navLinks[1], 'navServices', dt.navServices);
            if (navLinks[2]) bindSyncKey(navLinks[2], 'navAbout', dt.navAbout);
            if (navLinks[3]) bindSyncKey(navLinks[3], 'navProcess', dt.navProcess);
            if (navLinks[4]) bindSyncKey(navLinks[4], 'navContact', dt.navContact);

            bindSyncKey('#hd a.btn.y, .hd a.talk, a.btn.talk', 'navCta', dt.navCta);

            bindSyncKey('h1.hl, .hero h1', 'heroTitle', dt.heroTitle);
            bindSyncKey('.hc p, .hero p', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('.hc .btn:first-child, .acts a:first-child', 'btnViewWork', dt.btnViewWork);
            bindSyncKey('.hc .btn.g, .acts a:last-child', 'btnTalk', dt.btnTalk);

            bindSyncKey('#work .sh h2, .wk .sh h2', 'selectedHeading', dt.selectedHeading);
            bindSyncKey('#work .sh p, #work p.sub', 'selectedSub', dt.selectedSub);

            const cases = doc.querySelectorAll('#work ul.bento figcaption, #work figcaption');
            if (cases[0]) bindSyncKey(cases[0], 'project1', dt.project1);
            if (cases[1]) bindSyncKey(cases[1], 'project2', dt.project2);
            if (cases[2]) bindSyncKey(cases[2], 'project3', dt.project3);
            if (cases[3]) bindSyncKey(cases[3], 'project4', dt.project4);
            if (cases[4]) bindSyncKey(cases[4], 'project5', dt.project5);
            if (cases[5]) bindSyncKey(cases[5], 'project6', dt.project6);
            if (cases[6]) bindSyncKey(cases[6], 'project7', dt.project7);

            bindSyncKey('#featured .fi h2, #featured h2', 'project8', dt.project8);
            bindSyncKey('#featured .fi p, #featured p', 'caseStudyCallout', dt.caseStudyCallout);

            bindSyncKey('#services .sh h2, section#services h2', 'servicesHeading', dt.servicesHeading);
            bindSyncKey('#about h2, section#about h2', 'aboutHeading', dt.aboutHeading);
            bindSyncKey('#about p, section#about p', 'aboutBio', dt.aboutBio);
            bindSyncKey('#process .sh h2, #process h2', 'processHeading', dt.processHeading);

            bindSyncKey('#contact h2, section#contact h2', 'contactHeading', dt.contactHeading);
            bindSyncKey('#contact a.mail, a.mail', 'contactEmail', dt.contactEmail);
            bindSyncKey('footer small', 'footerCopyright', dt.footerCopyright);
            bindSyncKey('footer button#up, button#up', 'backToTop', dt.backToTop);
          }

          // 6) 3D Web Developer Portfolio
          if (htmlSrc?.includes('web-developer')) {
            bindSyncKey('a.brand, header .brand', 'brandName', dt.brandName);
            const navLinks = doc.querySelectorAll('nav.links a');
            if (navLinks[0]) bindSyncKey(navLinks[0], 'navProjects', dt.navProjects);
            if (navLinks[1]) bindSyncKey(navLinks[1], 'navResume', dt.navResume);
            bindSyncKey('nav.links a.hire, a.hire', 'btnHire', dt.btnHire);

            bindSyncKey('section.slide:nth-of-type(1) .stage .word', 'slide1Word', dt.slide1Word);
            bindSyncKey('section.slide:nth-of-type(1) .meta h2', 'slide1Title', dt.slide1Title);
            bindSyncKey('section.slide:nth-of-type(1) .meta p:nth-of-type(1)', 'slide1Available', dt.slide1Available);
            bindSyncKey('section.slide:nth-of-type(1) .meta p:nth-of-type(2)', 'slide1Stack', dt.slide1Stack);
            bindSyncKey('section.slide:nth-of-type(1) .side p', 'slide1SideText', dt.slide1SideText);

            const slide1Links = doc.querySelectorAll('section.slide:nth-of-type(1) .meta p:nth-of-type(3) a');
            if (slide1Links[0]) bindSyncKey(slide1Links[0], 'slide1Link1', dt.slide1Link1);
            if (slide1Links[1]) bindSyncKey(slide1Links[1], 'slide1Link2', dt.slide1Link2);

            bindSyncKey('section.slide:nth-of-type(2) .stage .word', 'slide2Word', dt.slide2Word);
            bindSyncKey('section.slide:nth-of-type(2) .meta h2', 'slide2Title', dt.slide2Title);
            bindSyncKey('section.slide:nth-of-type(2) .meta p:nth-of-type(1)', 'slide2Available', dt.slide2Available);
            bindSyncKey('section.slide:nth-of-type(2) .meta p:nth-of-type(2)', 'slide2Stack', dt.slide2Stack);
            bindSyncKey('section.slide:nth-of-type(2) .side p', 'slide2SideText', dt.slide2SideText);

            const slide2Links = doc.querySelectorAll('section.slide:nth-of-type(2) .meta p:nth-of-type(3) a');
            if (slide2Links[0]) bindSyncKey(slide2Links[0], 'slide2Link1', dt.slide2Link1);
            if (slide2Links[1]) bindSyncKey(slide2Links[1], 'slide2Link2', dt.slide2Link2);
          }

          // 7) Evelyn's Editorial 30th Soirée
          if (htmlSrc?.includes('editorial-evelyn')) {
            // Auto-reveal invitation card if user is editing details or in live preview
            const cardEdited = Boolean(
              dt.eventDate || dt.eventTime || dt.eventVenue || dt.dressCode || dt.invitationNote || dt.rsvpDeadline
            );
            if (cardEdited && typeof (win as any).openInvitation === 'function') {
              (win as any).openInvitation();
            }

            bindSyncKey('#recipientLine p, p.font-script, [data-sync-key="recipientTag"]', 'recipientTag', dt.recipientTag);
            bindSyncKey('#envelopeBox span.font-script, #slidingCard span.font-script, h2.inv-line, [data-sync-key="celebrantName"]', 'celebrantName', dt.celebrantName);
            bindSyncKey('#slidingCard span.font-serif, h1.inv-line, [data-sync-key="eventTitle"]', 'eventTitle', dt.eventTitle);
            bindSyncKey('#slidingCard span:first-child, p.inv-line:first-child, [data-sync-key="invitationKicker"]', 'invitationKicker', dt.invitationKicker);
            bindSyncKey('#fullCard .space-y-2 p:nth-child(1), [data-sync-key="eventDate"]', 'eventDate', dt.eventDate);
            bindSyncKey('#fullCard .space-y-2 p:nth-child(2), [data-sync-key="eventTime"]', 'eventTime', dt.eventTime);
            bindSyncKey('#fullCard .space-y-2 p:nth-child(3), [data-sync-key="eventVenue"]', 'eventVenue', dt.eventVenue);
            bindSyncKey('#fullCard p.font-sans.mb-2, [data-sync-key="dressCode"]', 'dressCode', dt.dressCode);
            bindSyncKey('#fullCard p.font-serif.italic.leading-relaxed, [data-sync-key="invitationNote"]', 'invitationNote', dt.invitationNote);
            bindSyncKey('#rsvpBtn, [data-sync-key="rsvpBtn"]', 'rsvpBtn', dt.rsvpBtn);
            bindSyncKey('#fullCard span.tracking-\\[0\\.16em\\], [data-sync-key="rsvpDeadline"]', 'rsvpDeadline', dt.rsvpDeadline);
            bindSyncKey('#rsvpContent h3, [data-sync-key="rsvpHeading"]', 'rsvpHeading', dt.rsvpHeading);
          }

          // 8) Sarah's Midnight Neon 25th
          if (htmlSrc?.includes('midnight-party-sarah')) {
            bindSyncKey('.guest-tag, [data-sync-key="guestTag"]', 'guestTag', dt.guestTag);
            bindSyncKey('.polaroid-caption, [data-sync-key="polaroidCaption"]', 'polaroidCaption', dt.polaroidCaption);
            bindSyncKey('.brush-accent, [data-sync-key="brushAccent"]', 'brushAccent', dt.brushAccent);
            bindSyncKey('h1.name-headline, [data-sync-key="celebrantName"]', 'celebrantName', dt.celebrantName);
            bindSyncKey('.giant-age-backdrop, [data-sync-key="giantAge"]', 'giantAge', dt.giantAge);
            bindSyncKey('.ticket-val-hero:first-child, [data-sync-key="eventDateTime"]', 'eventDateTime', dt.eventDateTime);
            bindSyncKey('.ticket-val-hero[style*="lime"], [data-sync-key="ticketAdmit"]', 'ticketAdmit', dt.ticketAdmit);
            bindSyncKey('.ticket-venue span:first-child, [data-sync-key="venueName"]', 'venueName', dt.venueName);
            bindSyncKey('.ticket-venue span[style*="font-size: 10px"], [data-sync-key="venueAddress"]', 'venueAddress', dt.venueAddress);
            bindSyncKey('.dress-code-val, [data-sync-key="dressCode"]', 'dressCode', dt.dressCode);
            bindSyncKey('.marquee-track, [data-sync-key="marqueeTrack"]', 'marqueeTrack', dt.marqueeTrack);
            bindSyncKey('.sheet-title, [data-sync-key="sheetTitle"]', 'sheetTitle', dt.sheetTitle);
            bindSyncKey('#btn-submit, [data-sync-key="rsvpSubmitBtn"]', 'rsvpSubmitBtn', dt.rsvpSubmitBtn);
          }

          // 9) Valentin's Speculative Noir Protocol
          if (htmlSrc?.includes('valentin-speculative')) {
            bindSyncKey('[data-sync-key="protocolHeader"], span.font-label-md.tracking-\\[0\\.3em\\]', 'protocolHeader', dt.protocolHeader);
            bindSyncKey('[data-sync-key="heroTitle"], h1.font-display-hero span', 'heroTitle', dt.heroTitle);
            bindSyncKey('[data-sync-key="eventDate"], h2.font-numeral-xl:first-of-type', 'eventDate', dt.eventDate);
            bindSyncKey('[data-sync-key="eventTime"], .flex.items-baseline.gap-2 h2.font-numeral-xl', 'eventTime', dt.eventTime);
            bindSyncKey('[data-sync-key="eventVenue"], .font-headline-sm.text-primary.uppercase', 'eventVenue', dt.eventVenue);
            bindSyncKey('[data-sync-key="venueSubtitle"], span.font-label-sm.text-secondary-fixed', 'venueSubtitle', dt.venueSubtitle);
            bindSyncKey('[data-sync-key="helipadNote"], .font-label-sm.uppercase.tracking-wider', 'helipadNote', dt.helipadNote);
            bindSyncKey('[data-sync-key="invitationKey"], span.font-label-md.tracking-\\[0\\.25em\\]', 'invitationKey', dt.invitationKey);
            bindSyncKey('#rsvp-slide-container h3, h3.font-headline-lg, [data-sync-key="rsvpHeading"]', 'rsvpHeading', dt.rsvpHeading);
            bindSyncKey('h4.font-headline-md, [data-sync-key="ticketTitle"]', 'ticketTitle', dt.ticketTitle);
            bindSyncKey('p.font-label-md.text-primary, [data-sync-key="ticketDate"]', 'ticketDate', dt.ticketDate);
          }

          // 10) Interactive Modern Birthday & WhatsApp RSVP
          if (htmlSrc?.includes('interactive-modern-invite')) {
            // Ensure card and leaf sections are visible immediately
            doc.querySelectorAll('.paper').forEach((p) => p.classList.add('in'));

            if (dt.celebrantName) {
              const mq = doc.getElementById('mq');
              if (mq) {
                mq.textContent = Array(14).fill(`${dt.celebrantName.toUpperCase()} • BIRTHDAY • `).join('');
              }
            }

            bindSyncKey('p.tag, [data-sync-key="heroTag"]', 'heroTag', dt.heroTag);
            bindSyncKey('#invite h3, [data-sync-key="inviteHeading"]', 'inviteHeading', dt.inviteHeading);
            bindSyncKey('[data-b="name"], [data-sync-key="celebrantName"]', 'celebrantName', dt.celebrantName);
            bindSyncKey('[data-b="date"], [data-sync-key="eventDate"]', 'eventDate', dt.eventDate);
            bindSyncKey('[data-b="time"], [data-sync-key="eventTime"]', 'eventTime', dt.eventTime);
            bindSyncKey('[data-b="venue"], [data-sync-key="eventVenue"]', 'eventVenue', dt.eventVenue);
            bindSyncKey('[data-b="address"], [data-sync-key="eventAddress"]', 'eventAddress', dt.eventAddress);
            bindSyncKey('a#map, [data-sync-key="mapBtn"]', 'mapBtn', dt.mapBtn);
            bindSyncKey('#rsvp h2, [data-sync-key="rsvpHeading"]', 'rsvpHeading', dt.rsvpHeading);
            bindSyncKey('#f button.btn, [data-sync-key="rsvpSubmit"]', 'rsvpSubmit', dt.rsvpSubmit);
            bindSyncKey('a#wa, [data-sync-key="waBtn"]', 'waBtn', dt.waBtn);
            bindSyncKey('p.end, [data-sync-key="closingTag"]', 'closingTag', dt.closingTag);
          }

          // 11) Enchanted Whispering Pines Birthday
          if (htmlSrc?.includes('enchanted-whispering-pines')) {
            bindSyncKey('.font-cinzel.uppercase.text-amber-200, [data-sync-key="heroBadge"]', 'heroBadge', dt.heroBadge);
            bindSyncKey('h1.hero-title-3d, [data-sync-key="heroTitle"]', 'heroTitle', dt.heroTitle);
            bindSyncKey('header p.cinematic-text-shadow, [data-sync-key="heroSubtitle"]', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('span.cinematic-text-shadow, [data-sync-key="eventDateTime"]', 'eventDateTime', dt.eventDateTime);
            bindSyncKey('span.truncate.cinematic-text-shadow, [data-sync-key="eventVenue"]', 'eventVenue', dt.eventVenue);
            bindSyncKey('#modal-details h2, [data-sync-key="detailsHeading"]', 'detailsHeading', dt.detailsHeading);
            bindSyncKey('[data-sync-key="eventAddress"]', 'eventAddress', dt.eventAddress);
            bindSyncKey('[data-sync-key="arrivalNote"]', 'arrivalNote', dt.arrivalNote);
            bindSyncKey('[data-sync-key="attire"]', 'attire', dt.attire);
            bindSyncKey('[data-sync-key="wishesNote"]', 'wishesNote', dt.wishesNote);
            bindSyncKey('#modal-rsvp h2, [data-sync-key="rsvpHeading"]', 'rsvpHeading', dt.rsvpHeading);
            bindSyncKey('#modal-rsvp p.text-\\[11px\\], [data-sync-key="rsvpSubtitle"]', 'rsvpSubtitle', dt.rsvpSubtitle);
          }

          // 12) Royal Heritage Wax Envelope Soirée
          if (htmlSrc?.includes('royal-luxury-envelope')) {
            const col = doc.getElementById('col');
            const cardEdited = Boolean(
              dt.celebrantName || dt.celebrantAge || dt.eventDate || dt.eventTime || dt.eventVenue || dt.eventAddress || dt.invitationNote
            );
            if (cardEdited) {
              if (col) col.classList.add('open');
              doc.querySelectorAll('#sc .rv').forEach((e) => e.classList.add('in'));
            }

            bindSyncKey('p.eyebrow[style*="--i:0"], [data-sync-key="eyebrow1"]', 'eyebrow1', dt.eyebrow1);
            bindSyncKey('p.eyebrow[style*="--i:1"], [data-sync-key="eyebrow2"]', 'eyebrow2', dt.eyebrow2);
            bindSyncKey('[data-k="name"], h1.script.rv, [data-sync-key="celebrantName"]', 'celebrantName', dt.celebrantName);
            bindSyncKey('[data-k="age"], .age.rv span, [data-sync-key="celebrantAge"]', 'celebrantAge', dt.celebrantAge);
            bindSyncKey('[data-k="date"], [data-sync-key="eventDate"]', 'eventDate', dt.eventDate);
            bindSyncKey('[data-k="time"], [data-sync-key="eventTime"]', 'eventTime', dt.eventTime);
            bindSyncKey('[data-k="venue"], [data-sync-key="eventVenue"]', 'eventVenue', dt.eventVenue);
            bindSyncKey('[data-k="address"], [data-sync-key="eventAddress"]', 'eventAddress', dt.eventAddress);
            bindSyncKey('[data-k="note"], [data-sync-key="invitationNote"]', 'invitationNote', dt.invitationNote);
            bindSyncKey('[data-k="rsvpBy"], [data-sync-key="rsvpDeadline"]', 'rsvpDeadline', dt.rsvpDeadline);
            bindSyncKey('a#map, [data-sync-key="mapBtn"]', 'mapBtn', dt.mapBtn);
            bindSyncKey('.thanks h2, [data-sync-key="thankYouHeading"]', 'thankYouHeading', dt.thankYouHeading);
            bindSyncKey('.thanks p.script, [data-sync-key="thankYouNote"]', 'thankYouNote', dt.thankYouNote);
          }

          // 13) Janamdin Mubarak (जन्मदिन मुबारक)
          if (htmlSrc?.includes('janamdin-mubarak-hindi')) {
            bindSyncKey('h1.st, [data-sync-key="heroTitle"]', 'heroTitle', dt.heroTitle);
            bindSyncKey('p.sub.st, [data-sync-key="heroSubtitle"]', 'heroSubtitle', dt.heroSubtitle);
            bindSyncKey('.g[data-a=".17"] .big.st:last-of-type, [data-sync-key="verse1Title"]', 'verse1Title', dt.verse1Title);
            bindSyncKey('.g[data-a=".17"] p.note.st, [data-sync-key="verse1Note"]', 'verse1Note', dt.verse1Note);
            bindSyncKey('.g[data-a=".41"] .row:nth-child(1) span, [data-sync-key="wish1"]', 'wish1', dt.wish1);
            bindSyncKey('.g[data-a=".41"] .row:nth-child(2) span, [data-sync-key="wish2"]', 'wish2', dt.wish2);
            bindSyncKey('.g[data-a=".41"] .row:nth-child(3) span, [data-sync-key="wish3"]', 'wish3', dt.wish3);
            bindSyncKey('.g[data-a=".41"] .row:nth-child(4) span, [data-sync-key="wish4"]', 'wish4', dt.wish4);
            bindSyncKey('.g[data-a=".64"] .big.s.st:last-of-type, [data-sync-key="verse2Title"]', 'verse2Title', dt.verse2Title);
            bindSyncKey('.g[data-a=".64"] p.note.st, [data-sync-key="verse2Note"]', 'verse2Note', dt.verse2Note);
            bindSyncKey('.g.end p.note.st, [data-sync-key="finalWish"]', 'finalWish', dt.finalWish);
          }

          // C. Universal sync for ANY remaining field in defaultTexts
          Object.entries(dt).forEach(([k, v]) => {
            if (v !== undefined) {
              bindSyncKey(null, k, v);
            }
          });

          // D. Universal Inline Click-To-Edit for Any Remaining Leaf Text Elements
          const leafTextCandidates = doc.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, h5, h6, p, blockquote, figcaption'
          );
          leafTextCandidates.forEach((el) => {
            // Avoid making layout wrappers or interactive buttons editable containers
            if (
              el.id === 'col' ||
              el.id === 'envelopeScene' ||
              el.closest('form') ||
              el.closest('button') ||
              el.querySelector('h1, h2, h3, h4, h5, h6, p, form, button, input, textarea')
            ) {
              return;
            }

            if (!el.getAttribute('data-editable-bound')) {
              el.setAttribute('data-editable-bound', 'true');
              el.setAttribute('contenteditable', 'true');
              el.setAttribute('spellcheck', 'false');
              el.setAttribute('title', 'Click to edit text');
              el.style.cursor = 'text';

              el.addEventListener('click', (e) => {
                if (el.tagName === 'A' || el.closest('a')) {
                  e.preventDefault();
                }
              });

              el.addEventListener('focus', () => {
                el.style.outline = '2px solid #10b981';
                el.style.outlineOffset = '2px';
              });
              el.addEventListener('blur', () => {
                el.style.outline = 'none';
              });
            }
          });
        }

        // Listen for form submissions (like RSVP forms in HTML templates) and direct to WhatsApp with overfill
        const forms = doc.querySelectorAll('form');
        forms.forEach((form) => {
          if (!form.getAttribute('data-rsvp-bound')) {
            form.setAttribute('data-rsvp-bound', 'true');
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const formData = new FormData(form as HTMLFormElement);
              const rsvpObj: Record<string, unknown> = {};
              formData.forEach((val, key) => {
                rsvpObj[key] = val;
              });
              if (onRsvpSubmit) {
                onRsvpSubmit(rsvpObj);
              }

              const formEl = form as HTMLFormElement;
              const nameInput = formEl.querySelector<HTMLInputElement>('input[name*="name" i], input[id*="name" i], input[type="text"]');
              const mobileInput = formEl.querySelector<HTMLInputElement>('input[type="tel"], input[name*="phone" i], input[name*="mobile" i]');
              const guestSelect = formEl.querySelector<HTMLSelectElement | HTMLInputElement>('select[name*="guest" i], input[name*="guest" i]');
              const attendSelect = formEl.querySelector<HTMLSelectElement | HTMLInputElement>('select[name*="attend" i], input[name*="attend" i]:checked, select[id*="attend" i]');
              const wishesText = formEl.querySelector<HTMLTextAreaElement>('textarea');

              const guestName = (rsvpObj.name || rsvpObj.guestName || nameInput?.value || 'Friend / Guest').toString();
              const guestMobile = (rsvpObj.mobile || rsvpObj.phone || mobileInput?.value || '').toString();
              const attendance = (rsvpObj.attendance || attendSelect?.value || 'yes').toString();
              const guestCount = (rsvpObj.guestCount || rsvpObj.guests || guestSelect?.value || '1').toString();
              const wishes = (rsvpObj.wishes || rsvpObj.message || wishesText?.value || '').toString();

              openWhatsAppWithMessage({
                eventTitle: data?.title || templateTitle,
                eventType: data?.eventType || 'Celebration',
                date: data?.date,
                time: data?.time,
                venue: data?.venue,
                address: data?.address,
                guestName,
                guestMobile,
                attendance,
                guestCount,
                wishes,
                recipientPhone: (data?.rsvpSettings as any)?.phone,
              });

              const submitBtn = formEl.querySelector('button[type="submit"], input[type="submit"]');
              if (submitBtn) {
                const prev = submitBtn.textContent;
                submitBtn.textContent = '✓ Opening WhatsApp...';
                setTimeout(() => { if (prev) submitBtn.textContent = prev; }, 3000);
              }
            });
          }
        });

        // Intercept any WhatsApp links inside iframe to ensure they are overfilled
        const waLinks = doc.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"], [data-whatsapp]');
        waLinks.forEach((anchor) => {
          if (!anchor.getAttribute('data-wa-bound')) {
            anchor.setAttribute('data-wa-bound', 'true');
            anchor.addEventListener('click', (e) => {
              e.preventDefault();
              openWhatsAppWithMessage({
                eventTitle: data?.title || templateTitle,
                eventType: data?.eventType || 'Celebration',
                date: data?.date,
                time: data?.time,
                venue: data?.venue,
                address: data?.address,
                guestName: 'Friend / Guest',
                attendance: 'yes',
                guestCount: '1',
                recipientPhone: (data?.rsvpSettings as any)?.phone,
              });
            });
          }
        });
      } catch (err) {
        console.debug('Iframe DOM synchronization note:', err);
      }
    };

    const handleLoad = () => {
      setIsLoading(false);
      syncDom();
      setTimeout(syncDom, 50);
      setTimeout(syncDom, 200);
      setTimeout(syncDom, 600);
      setTimeout(syncDom, 1200);
      setTimeout(syncDom, 2500);
    };

    // Staggered sync executions to guarantee binding on instant loads, async components and keystrokes
    syncDom();
    const t1 = setTimeout(syncDom, 60);
    const t2 = setTimeout(syncDom, 200);
    const t3 = setTimeout(syncDom, 600);
    const t4 = setTimeout(syncDom, 1200);
    const t5 = setTimeout(syncDom, 2000);
    const t6 = setTimeout(syncDom, 3500);

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [data, onRsvpSubmit]);


  const isPortfolio =
    data?.eventType?.toLowerCase() === 'portfolio' ||
    (data as any)?.category === 'portfolio';
  const isMusicConfigured = data?.musicSettings
    ? data.musicSettings.enabled
    : isPortfolio
    ? Boolean(data?.musicUrl)
    : Boolean(data?.musicUrl);
  const musicUrl = isMusicConfigured
    ? (data?.musicSettings?.url || (data as unknown as Record<string, unknown>)?.musicUrl as string || (isPortfolio ? '' : '/music/happy-birthday.mp3'))
    : '';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState<'yes' | 'no'>('yes');
  const [rsvpGuests, setRsvpGuests] = useState('1');
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpSent, setRsvpSent] = useState(false);

  const handleFloatingRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    openWhatsAppWithMessage({
      eventTitle: data?.title || templateTitle,
      eventType: data?.eventType || 'Celebration',
      date: data?.date,
      time: data?.time,
      venue: data?.venue,
      address: data?.address,
      guestName: rsvpName.trim(),
      guestMobile: rsvpPhone.trim(),
      attendance: rsvpAttending,
      guestCount: rsvpGuests,
      wishes: rsvpWishes.trim(),
      recipientPhone: (data?.rsvpSettings as any)?.phone,
    });

    onRsvpSubmit?.({
      name: rsvpName.trim(),
      phone: rsvpPhone.trim(),
      attendance: rsvpAttending,
      guestCount: rsvpGuests,
      wishes: rsvpWishes.trim(),
    });

    setRsvpSent(true);
    setTimeout(() => {
      setRsvpSent(false);
      setIsRsvpModalOpen(false);
    }, 2500);
  };

  const toggleMusic = () => {
    if (!audioRef.current || !musicUrl) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch((err) => console.debug('Audio play note:', err));
    }
  };
  void toggleMusic;

  return (
    <div className="relative w-full h-full min-h-[520px] md:min-h-[760px] flex flex-col bg-stone-950 rounded-xl overflow-hidden shadow-2xl border border-stone-800/60">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-950/90 backdrop-blur-sm text-stone-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono tracking-wide">Loading interactive HTML experience...</p>
        </div>
      )}

      {/* Background Birthday Song Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          onPlay={() => setIsPlayingMusic(true)}
          onPause={() => setIsPlayingMusic(false)}
        />
      )}

      {/* Audio Element for Music */}

      {/* Floating WhatsApp RSVP Modal */}
      {isRsvpModalOpen && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">chat</span>
                <h4 className="font-bold text-sm">Send RSVP via WhatsApp</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsRsvpModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {rsvpSent ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-emerald-400 text-[42px] mb-2">check_circle</span>
                <p className="font-bold text-base text-emerald-300">WhatsApp Launched!</p>
                <p className="text-xs text-stone-300 mt-1">Your pre-filled RSVP note is ready to send in WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleFloatingRsvpSubmit} className="mt-3 space-y-3">
                <p className="text-[11px] text-stone-400 leading-tight">
                  Fill in your details below and WhatsApp will open directly with your complete pre-filled RSVP message.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Maya & Alex"
                    className="w-full h-9 px-3 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Attendance</label>
                    <select
                      value={rsvpAttending}
                      onChange={(e) => setRsvpAttending(e.target.value as 'yes' | 'no')}
                      className="w-full h-9 px-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="yes">Attending 🎉</option>
                      <option value="no">Declining ❌</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Total Guests</label>
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      className="w-full h-9 px-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons</option>
                      <option value="3">3 Persons</option>
                      <option value="4+">4+ Persons</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Your WhatsApp / Mobile</label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full h-9 px-3 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Wishes / Note (Optional)</label>
                  <textarea
                    rows={2}
                    value={rsvpWishes}
                    onChange={(e) => setRsvpWishes(e.target.value)}
                    placeholder="Congratulations! Can't wait to celebrate!"
                    className="w-full p-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>Send via WhatsApp (Pre-filled)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* The Native HTML Template Iframe */}
      <iframe
        ref={iframeRef}
        src={htmlSrc}
        title={data?.title || templateTitle}
        className="w-full flex-1 min-h-[500px] md:min-h-[720px] border-0 bg-transparent"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
      />
    </div>
  );
};

/**
 * Higher-Order Component factory to produce a TemplateProps-compatible
 * React component for each HTML template.
 */
export const createHtmlTemplateComponent = (
  htmlSrc: string,
  templateTitle: string
): React.FC<TemplateProps> => {
  const Component: React.FC<TemplateProps> = (props) => (
    <HtmlIframeTemplate
      {...props}
      htmlSrc={htmlSrc}
      templateTitle={templateTitle}
    />
  );
  Component.displayName = `HtmlTemplate(${templateTitle})`;
  return Component;
};

// Specialized React components for curated templates
export const EditorialEvelynTemplate = createHtmlTemplateComponent(
  '/html-templates/editorial-evelyn-30th.html',
  "Evelyn's Editorial 30th Soirée"
);

export const MidnightPartySarahTemplate = createHtmlTemplateComponent(
  '/html-templates/midnight-party-sarah-25th.html',
  "Sarah's Midnight Neon Party"
);

export const CinematicElenaJulianWeddingTemplate = createHtmlTemplateComponent(
  '/html-templates/cinematic-elena-julian-wedding.html',
  'Elena & Julian Cinematic Wedding'
);

export const MidsummerEveningInvitationTemplate = createHtmlTemplateComponent(
  '/html-templates/midsummer-evening-invitation.html',
  'A Midsummer Evening Soirée'
);

export const ValentinSpeculativeNoirTemplate = createHtmlTemplateComponent(
  '/html-templates/valentin-speculative-noir.html',
  "Valentin's Speculative Noir Protocol"
);

export const GoldenStarsCelebrationTemplate = createHtmlTemplateComponent(
  '/html-templates/golden-stars-celebration.html',
  "Golden Stars Celebration Invitation"
);

export const InteractiveModernInviteTemplate = createHtmlTemplateComponent(
  '/html-templates/interactive-modern-invite.html',
  "Interactive Modern Birthday & WhatsApp RSVP"
);

export const EnchantedWhisperingPinesTemplate = createHtmlTemplateComponent(
  '/html-templates/enchanted-whispering-pines.html',
  "Enchanted Whispering Pines Birthday"
);

export const RoyalLuxuryEnvelopeTemplate = createHtmlTemplateComponent(
  '/html-templates/royal-luxury-envelope.html',
  "Royal Heritage Wax Envelope Soirée"
);

export const RoyalRoseMomentsTemplate = createHtmlTemplateComponent(
  '/html-templates/royal-rose-moments.html',
  "Royal Rose Moments Celebration"
);

export const JanamdinMubarakHindiTemplate = createHtmlTemplateComponent(
  '/html-templates/janamdin-mubarak-hindi.html',
  "जन्मदिन मुबारक - Janamdin Mubarak"
);

// Portfolio Templates (Tempo.tt Collection)
export const DesignGalleryPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/design-gallery-portfolio.html',
  '2022 Design Gallery — Editorial Portfolio'
);

export const ThreeDInMotionPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/3d-in-motion-portfolio.html',
  '3D in Motion — 3D Character Artist & Animator'
);

export const EmiwayMinecraftPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/emiway-minecraft-portfolio.html',
  'EMIWAY | Minecraft Player & Creator Portfolio'
);

export const AlexThreeDDesignerPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/alex-3d-designer-portfolio.html',
  "Hi, I'm Alex — 3D Designer Portfolio"
);

export const MotionDesignerPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/motion-designer-portfolio.html',
  'Motion Graphics Designer Portfolio'
);

export const WebDeveloperThreeDPortfolioTemplate = createHtmlTemplateComponent(
  '/html-templates/web-developer-portfolio.html',
  '3D Web Developer Interactive Portfolio'
);
