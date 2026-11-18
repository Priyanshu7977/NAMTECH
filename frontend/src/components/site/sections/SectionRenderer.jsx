import { Fragment } from 'react';
import * as Content from './ContentSections';
import * as Home from './HomeSections';
import * as Inner from './InnerSections';
import * as Listing from './ListingSections';

const components = {
    home_hero: Home.HomeHero,
    feature_blocks: Home.FeatureBlocks,
    academics_tabs: Home.AcademicsTabs,
    partners_showcase: Home.PartnersShowcase,
    faculty_showcase: Home.FacultyShowcase,
    labs_showcase: Home.LabsShowcase,
    campus_showcase: Home.CampusShowcase,
    mission: Home.Mission,
    news_carousel: Home.NewsCarousel,
    page_hero: Content.PageHero,
    intro: Content.Intro,
    rich_text: Content.RichTextSection,
    image_text: Content.ImageText,
    card_grid: Content.CardGrid,
    stats_band: Content.StatsBand,
    media_cards: Content.MediaCards,
    tabs: Content.TabsSection,
    faq: Content.Faq,
    steps: Content.Steps,
    people: Content.People,
    programs_list: Content.ProgramsList,
    post_list: Content.PostList,
    logo_strip: Content.LogoStrip,
    testimonials: Content.Testimonials,
    gallery: Content.GallerySection,
    video: Content.VideoSection,
    documents: Content.Documents,
    cta_band: Content.CtaBand,
    enquiry_form: Content.EnquiryFormSection,
    subnav: Inner.Subnav,
    image_statement: Inner.ImageStatement,
    value_list: Inner.ValueList,
    stat_cards: Inner.StatCards,
    timeline: Inner.Timeline,
    video_feature: Inner.VideoFeature,
    leaders_grid: Inner.LeadersGrid,
    achievements: Inner.Achievements,
    pillars: Inner.Pillars,
    date_tables: Inner.DateTables,
    eligibility: Inner.Eligibility,
    checklist_cards: Inner.ChecklistCards,
    fees: Inner.Fees,
    feature_list: Inner.FeatureList,
    contact_cards: Inner.ContactCards,
    contact_band: Inner.ContactBand,
    accordion_media: Inner.AccordionMedia,
    numbered_list: Inner.NumberedList,
    card_tabs: Inner.CardTabs,
    tabs_media: Inner.TabsMedia,
    image_list: Inner.ImageList,
    image_mosaic: Inner.ImageMosaic,
    image_carousel: Inner.ImageCarousel,
    placement_trends: Inner.PlacementTrends,
    programs_tabs: Listing.ProgramsTabs,
    events_carousel: Listing.EventsCarousel,
    publications_carousel: Listing.PublicationsCarousel,
    program_finder: Listing.ProgramFinder,
    program_levels: Listing.ProgramLevels,
    job_listings: Listing.JobListings,
};

/** Renders CMS sections in order. Unknown types are skipped so old content can never break a page. */
export default function SectionRenderer({ sections, page }) {
    return (sections ?? []).map((section, index) => {
        const Component = components[section.type];
        if (!Component) return null;
        const content = <Component data={section.data ?? {}} page={page} first={index === 0} anchor={section.anchor} />;
        return section.anchor ? (
            <div key={section.id} id={section.anchor}>
                {content}
            </div>
        ) : (
            <Fragment key={section.id}>{content}</Fragment>
        );
    });
}
