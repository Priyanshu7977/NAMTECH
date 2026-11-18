import { useState } from 'react';
import Carousel from '../../../components/Carousel';
import Icon from '../../../components/Icon';
import { PostCard } from '../../../components/site/Cards';
import { Pagination } from '../../../components/site/Common';
import { visit } from '../../../components/site/Filters';
import Layout from '../../../components/site/Layout';
import ListingShell from '../../../components/site/ListingShell';

export default function Blogs({ title, sections, breadcrumbs, featured, posts, topics, filters }) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (params) => visit('/blogs', { ...filters, q: q || undefined, ...params, page: undefined });

    return (
        <ListingShell title={title} sections={sections} breadcrumbs={breadcrumbs}>
            {featured?.length ? (
                <section className="mb-5" aria-labelledby="featured-blogs">
                    <h2 className="nt-h3" id="featured-blogs">Featured</h2>
                    <Carousel label="Featured blogs" slideWidth="min(21rem, 82%)" gap="1.5rem">
                        {featured.map((post) => <PostCard key={post.id} post={post} />)}
                    </Carousel>
                </section>
            ) : null}
            <form className="nt-filters nt-form" role="search" aria-label="Find blogs" onSubmit={(e) => {
                e.preventDefault();
                apply({});
            }}>
                <div className="nt-search-box flex-grow-1" style={{ maxWidth: '26rem' }}>
                    <label className="visually-hidden" htmlFor="blog-q">Search blogs</label>
                    <input id="blog-q" type="search" className="form-control" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
                    <Icon name="search" strokeWidth={1.8} />
                </div>
                {Object.keys(topics).length ? (
                    <div>
                        <label className="visually-hidden" htmlFor="blog-topic">Topic</label>
                        <select id="blog-topic" className="form-select" value={filters.topic ?? ''} onChange={(e) => apply({ topic: e.target.value || undefined })}>
                            <option value="">All topics</option>
                            {Object.entries(topics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                ) : null}
                <div>
                    <label className="visually-hidden" htmlFor="blog-sort">Sort</label>
                    <select id="blog-sort" className="form-select" value={filters.sort} onChange={(e) => apply({ sort: e.target.value === 'recent' ? undefined : e.target.value })}>
                        <option value="recent">Most recent</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>
            </form>
            <p className="visually-hidden" role="status">{posts.total} blogs found</p>
            {posts.data.length ? (
                <div className="nt-card-grid nt-card-grid--3 nt-stagger">
                    {posts.data.map((post) => <PostCard key={post.id} post={post} headingLevel={2} />)}
                </div>
            ) : (
                <p className="nt-empty">No blogs match your search.</p>
            )}
            <Pagination meta={posts} />
        </ListingShell>
    );
}

Blogs.layout = (page) => <Layout>{page}</Layout>;
