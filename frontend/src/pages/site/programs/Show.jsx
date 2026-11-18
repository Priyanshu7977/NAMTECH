import { useEffect, useId, useRef, useState } from 'react';
import { FacultyGrid } from '../../../components/site/Cards';
import { blockSwitch, RichText } from '../../../components/site/Common';
import EnquiryForm from '../../../components/site/EnquiryForm';
import Layout from '../../../components/site/Layout';
import * as M from '../../../components/site/ProgramModules';
import SectionRenderer from '../../../components/site/sections/SectionRenderer';
import { Media } from '../../../components/ResponsiveImage';
import SmartLink from '../../../components/SmartLink';
import { initCountUp } from '../../../lib/motion';

const has = (list) => Array.isArray(list) && list.length > 0;

/**
 * Program page ("Programmes - Template" designs): hero, then a sticky tab bar with one panel per tab.
 * A module is shown when it has content and has not been switched off in the CMS ("Page blocks");
 * a tab with no modules left is dropped from the bar.
 */
export default function ProgramShow({ program, details = {}, tabs, faculty, sections, hidden, breadcrumbs, programs }) {
    const show = blockSwitch(hidden);
    const d = details;
    const hasBrochure = Boolean(d.brochure?.file) && show('brochure');
    const hasOverview = (show('overview') && Boolean(program.body)) || show('snapshot');
    const whyInOverview = hasOverview && show('_overview') && show('why_choose') && has(d.why_choose?.items);

    // [key, has content, render(lead)] per tab. "lead" is true for the first module of a tab, which
    // carries the tab's large heading.
    const modules = {
        overview: [
            // Overview text and snapshot share one block; each has its own switch.
            // As in the template, "Why choose" sits under the overview text, beside the snapshot card.
            ['_overview', hasOverview, (lead) => (
                <Overview
                    key="overview"
                    program={program}
                    snapshot={show('snapshot') ? d.snapshot : null}
                    showBody={show('overview')}
                    lead={lead}
                    why={whyInOverview ? <M.WhyChoose data={d.why_choose} /> : null}
                />
            )],
            ['why_choose', has(d.why_choose?.items) && !whyInOverview, () => <M.WhyChoose key="why" data={d.why_choose} />],
            ['class_profile', Boolean(d.class_profile?.image) || has(d.class_profile?.mix) || has(d.class_profile?.stats), () => <M.ClassProfile key="class" data={d.class_profile} />],
            ['partners', has(d.partners?.items), (lead) => <M.CardCarousel key="partners" heading={d.partners.heading || 'Program Partners'} items={d.partners.items} lead={lead} />],
            ['faculty', has(faculty), () => (
                <div key="faculty" className="nt-prog__block">
                    <h3 className="nt-prog__subtitle">Faculty</h3>
                    <FacultyGrid people={faculty} />
                </div>
            )],
        ],
        structure: [
            ['structure', has(d.structure?.semesters), (lead) => <M.Structure key="structure" data={d.structure} lead={lead} />],
            ['learning_model', has(d.learning_model?.cards) || has(d.learning_model?.mix) || Boolean(d.learning_model?.notes), (lead) => <M.LearningModel key="learning" data={d.learning_model} lead={lead} />],
            ['labs', has(d.labs?.items), (lead) => <M.Labs key="labs" data={d.labs} lead={lead} />],
        ],
        admissions: [
            ['admission_steps', has(d.admission_steps?.steps), (lead) => <M.AdmissionSteps key="steps" data={d.admission_steps} lead={lead} />],
            ['eligibility', has(d.eligibility?.criteria) || has(d.eligibility?.branches) || Boolean(d.eligibility?.intro), (lead) => <M.EligibilityModule key="elig" data={d.eligibility} lead={lead} />],
            ['documents', has(d.documents?.items), (lead) => <M.Documents key="docs" data={d.documents} lead={lead} />],
        ],
        outcomes: [
            ['outcomes', has(d.outcomes?.stats) || has(d.outcomes?.logos) || Boolean(d.outcomes?.brochure), (lead) => <M.Outcomes key="outcomes" data={d.outcomes} lead={lead} />],
            ['roles', has(d.roles?.items), (lead) => <M.Roles key="roles" data={d.roles} lead={lead} />],
            ['alumni', has(d.alumni?.items), (lead) => <M.PeopleCarousel key="alumni" heading={d.alumni.heading || 'Where Our Alumni Work'} items={d.alumni.items} lead={lead} />],
            ['recruiter_quotes', has(d.recruiter_quotes?.items), (lead) => <M.RecruiterQuotes key="quotes" data={d.recruiter_quotes} lead={lead} />],
            ['innovations', has(d.innovations?.items), (lead) => (
                <M.CardCarousel
                    key="innovations"
                    heading={d.innovations.heading || 'Student innovation and fruitful research'}
                    intro={d.innovations.intro}
                    items={d.innovations.items}
                    lead={lead}
                    cta={d.innovations.cta_url ? <SmartLink href={d.innovations.cta_url} className="nt-btn">View all</SmartLink> : null}
                />
            )],
            ['awards', has(d.awards?.items), (lead) => <M.CardCarousel key="awards" heading={d.awards.heading || 'Awards & Recognitions'} intro={d.awards.intro} items={d.awards.items} lead={lead} />],
        ],
        fees: [
            ['fees', Boolean(d.fees?.total) || has(d.fees?.rows) || has(d.fees?.scholarships) || has(d.fees?.notes), (lead) => <M.Fees key="fees" data={d.fees} lead={lead} />],
            ['loans', (d.loans?.providers ?? []).some((p) => has(p.items)), (lead) => <M.Loans key="loans" data={d.loans} lead={lead} />],
        ],
        life: [
            ['life_video', Boolean(d.life_video?.image || d.life_video?.video_url || d.life_video?.title || d.life_video?.intro), (lead) => <M.LifeVideo key="video" data={d.life_video} lead={lead} />],
            ['clubs', has(d.clubs?.items), () => <M.Clubs key="clubs" data={d.clubs} />],
            ['life_alumni', has(d.life_alumni?.items), (lead) => <M.PeopleCarousel key="lalumni" heading={d.life_alumni.heading || 'Hear From Our Alumni'} items={d.life_alumni.items} lead={lead} />],
            ['testimonials', has(d.testimonials?.items), (lead) => <M.Testimonials key="testimonials" data={d.testimonials} lead={lead} />],
        ],
        faqs: [
            ['faqs', has(d.faqs?.items), (lead) => <M.Faqs key="faqs" data={d.faqs} lead={lead} />],
            ['enquire', true, (lead) => (
                <div key="enquire" className="nt-prog__block nt-prog__enquire" id="enquire">
                    {lead ? <h2 className="nt-prog__title">Enquire about this program</h2> : <h3 className="nt-prog__subtitle">Enquire about this program</h3>}
                    <EnquiryForm type="program" programs={programs} defaultProgramId={program.id} />
                </div>
            )],
        ],
    };

    const visibleTabs = Object.entries(tabs)
        .map(([key, label]) => ({ key, label, items: (modules[key] ?? []).filter(([block, content]) => content && show(block)) }))
        .filter((tab) => tab.items.length);

    const [active, setActive] = useState(visibleTabs[0]?.key);
    const anchorRef = useRef(null);
    const id = useId();

    // Open the tab named in the address (#fees), and keep it in the address when switching.
    useEffect(() => {
        const fromHash = window.location.hash.slice(1);
        if (visibleTabs.some((t) => t.key === fromHash)) setActive(fromHash);
    }, []);

    // Switching tabs further down the page returns to the top of the new panel, just under the bar.
    const select = (key) => {
        setActive(key);
        window.history.replaceState(window.history.state, '', `#${key}`);
        const anchor = anchorRef.current;
        const header = document.querySelector('.nt-header');
        if (!anchor) return;
        const top = anchor.getBoundingClientRect().top + window.scrollY;
        const navbar = header?.querySelector('.nt-mainbar');
        if (window.scrollY > top - (header?.offsetHeight ?? 0)) {
            window.scrollTo({ top: top - (navbar?.offsetHeight ?? 0), behavior: 'smooth' });
        }
    };

    const onKeyDown = (e) => {
        const index = visibleTabs.findIndex((t) => t.key === active);
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = visibleTabs[(index + step + visibleTabs.length) % visibleTabs.length];
        select(next.key);
        document.getElementById(`${id}-tab-${next.key}`)?.focus();
    };

    // On narrow screens the tab list scrolls sideways; keep the selected tab in view.
    useEffect(() => {
        const button = document.getElementById(`${id}-tab-${active}`);
        const list = button?.parentElement;
        if (list && list.scrollWidth > list.clientWidth) list.scrollTo({ left: button.offsetLeft - 16, behavior: 'smooth' });
    }, [active]);

    // Statistics in a newly opened tab count up as they come into view.
    const firstTab = useRef(true);
    useEffect(() => {
        if (firstTab.current) {
            firstTab.current = false;
            return undefined;
        }
        return initCountUp(document.getElementById(`${id}-panel`) ?? document, { immediate: true });
    }, [active]);

    const current = visibleTabs.find((t) => t.key === active) ?? visibleTabs[0];
    const eyebrow = [program.school?.title, 'Programs'].filter(Boolean).join(' / ');

    return (
        <>
            <section className="nt-page-hero nt-prog-hero on-dark">
                <div className="nt-page-hero__grid">
                    <div className="nt-page-hero__content">
                        <p className="nt-pill align-self-start nt-hero-in">{eyebrow}</p>
                        <h1 className="nt-hero-in" style={{ '--d': 1 }}>{program.title}</h1>
                        {program.summary ? <p className="nt-page-hero__body nt-hero-in" style={{ '--d': 2 }}>{program.summary}</p> : null}
                        <div className="d-flex flex-wrap gap-3 mt-3 nt-hero-in" style={{ '--d': 3 }}>
                            {program.apply_url ? (
                                <SmartLink href={program.apply_url} className="nt-btn nt-btn--light" newTab={/^https?:/.test(program.apply_url)}>
                                    Apply now
                                </SmartLink>
                            ) : null}
                            {hasBrochure ? (
                                <a href="#enquiry:brochure" className="nt-btn nt-prog-hero__ghost">
                                    Download brochure
                                </a>
                            ) : null}
                        </div>
                    </div>
                    {program.image && show('hero_image') ? (
                        <div className="nt-page-hero__media">
                            <Media image={program.image} sizes="(min-width: 992px) 50vw, 100vw" priority />
                        </div>
                    ) : null}
                </div>
            </section>
            {/* The template goes straight from the hero to the tab bar; the hero's pill names the school. */}

            {visibleTabs.length ? (
                <>
                    <div ref={anchorRef} aria-hidden="true" />
                    <div className="nt-prog-tabs">
                        <div className="container">
                            <div className="nt-prog-tabs__list" role="tablist" aria-label="Program information" onKeyDown={onKeyDown}>
                                {visibleTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        role="tab"
                                        id={`${id}-tab-${tab.key}`}
                                        aria-selected={tab.key === current.key}
                                        aria-controls={`${id}-panel`}
                                        tabIndex={tab.key === current.key ? 0 : -1}
                                        onClick={() => select(tab.key)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {program.apply_url ? (
                                <SmartLink href={program.apply_url} className="nt-btn nt-prog-tabs__apply" newTab={/^https?:/.test(program.apply_url)}>
                                    Apply now
                                </SmartLink>
                            ) : null}
                        </div>
                    </div>
                    <section className="nt-section nt-prog" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${current.key}`} key={current.key}>
                        <div className="container">
                            {current.items.map(([, , render], i) => render(i === 0))}
                        </div>
                    </section>
                </>
            ) : null}

            <SectionRenderer sections={sections} page={{ title: program.title }} />
        </>
    );
}

/** Overview text with the program snapshot card beside it. */
function Overview({ program, snapshot, showBody, lead, why }) {
    return (
        <div className="nt-prog__block nt-prog-overview">
            <div className="nt-prog-overview__main">
                {lead ? <h2 className="nt-prog__title">Program Overview</h2> : null}
                {showBody ? program.body ? <RichText html={program.body} /> : <p className="text-muted">Detailed program information will be published soon. Please send an enquiry for the latest details.</p> : null}
                {why}
            </div>
            {snapshot !== null ? <M.Snapshot program={program} data={snapshot} /> : null}
        </div>
    );
}

ProgramShow.layout = (page) => <Layout>{page}</Layout>;
