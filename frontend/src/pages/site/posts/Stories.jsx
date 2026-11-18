import { Pagination } from '../../../components/site/Common';
import { FilterTabs } from '../../../components/site/Filters';
import Layout from '../../../components/site/Layout';
import ListingShell from '../../../components/site/ListingShell';
import { Media } from '../../../components/ResponsiveImage';
import SmartLink from '../../../components/SmartLink';
import { ArrowDot } from '../../../components/Icon';

function StoryTile({ post, large = false }) {
    return (
        <article className={`nt-story-tile ${large ? 'nt-story-tile--large' : ''}`}>
            <Media image={post.image} sizes={large ? '(min-width: 992px) 60vw, 100vw' : '(min-width: 992px) 30vw, 90vw'} alt="" className="nt-story-tile__media" />
            <div className="nt-story-tile__body">
                {post.category ? <span className="nt-tag align-self-start">{post.category}</span> : null}
                <h2><SmartLink href={post.url} className="stretched-link">{post.title}</SmartLink></h2>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
                <span className="nt-link-arrow" aria-hidden="true">Read story <ArrowDot /></span>
            </div>
        </article>
    );
}

export default function Stories({ title, sections, breadcrumbs, categories, featured, posts, filters }) {
    const tabs = [['', 'All'], ...Object.entries(categories)];
    return (
        <ListingShell title={title} sections={sections} breadcrumbs={breadcrumbs}>
            {tabs.length > 2 ? <FilterTabs label="Story type" items={tabs} active={filters.category ?? ''} href={(key) => (key ? `/impact/stories?category=${key}` : '/impact/stories')} /> : null}
            {featured ? <StoryTile post={featured} large /> : null}
            {posts.data.length ? (
                <div className="nt-card-grid nt-card-grid--3 mt-5 nt-stagger">
                    {posts.data.map((post) => <StoryTile key={post.id} post={post} />)}
                </div>
            ) : !featured ? (
                <p className="nt-empty">Stories will be published here soon.</p>
            ) : null}
            <Pagination meta={posts} />
        </ListingShell>
    );
}

Stories.layout = (page) => <Layout>{page}</Layout>;
