import { router } from '../../../router/navigation';
import { useState } from 'react';
import Icon from '../../../components/Icon';
import { PersonCard } from '../../../components/site/Cards';
import { Pagination } from '../../../components/site/Common';
import { FilterTabs } from '../../../components/site/Filters';
import Layout from '../../../components/site/Layout';
import ListingShell from '../../../components/site/ListingShell';

export default function FacultyIndex({ title, sections, breadcrumbs, people, schools, types, filters }) {
    const [q, setQ] = useState(filters.q ?? '');
    const search = (params) => router.get('/faculty', { ...filters, ...params }, { preserveScroll: true, preserveState: true, replace: true });
    const tabs = [['', 'All Faculty'], ...Object.entries(schools)];

    return (
        <ListingShell title={title} sections={sections} breadcrumbs={breadcrumbs}>
            {tabs.length > 2 ? <FilterTabs label="School" items={tabs} active={filters.school ?? ''} href={(key) => (key ? `/faculty?school=${key}` : '/faculty')} /> : null}
            <div className="d-flex flex-wrap gap-3 justify-content-end">
                <div>
                    <label className="visually-hidden" htmlFor="faculty-type">Faculty type</label>
                    <select id="faculty-type" className="form-select" value={filters.type ?? ''} onChange={(e) => search({ type: e.target.value || undefined, page: undefined })}>
                        <option value="">Residential and Visiting</option>
                        {Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label} Faculty</option>)}
                    </select>
                </div>
                <form className="nt-search-box" role="search" aria-label="Find faculty" onSubmit={(e) => {
                    e.preventDefault();
                    search({ q: q || undefined, page: undefined });
                }}>
                    <label className="visually-hidden" htmlFor="faculty-q">Name or research area</label>
                    <input id="faculty-q" type="search" className="form-control" placeholder="Search by name or research area" value={q} onChange={(e) => setQ(e.target.value)} />
                    <Icon name="search" strokeWidth={1.8} />
                </form>
            </div>
            <p className="visually-hidden" role="status">{people.total} profiles found</p>
            {people.data.length ? (
                <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4 mt-1 nt-stagger">
                    {people.data.map((person) => (
                        <div className="col" key={person.id}>
                            <PersonCard person={person} headingLevel={2} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="nt-empty">No faculty profiles match your search.</p>
            )}
            <Pagination meta={people} />
        </ListingShell>
    );
}

FacultyIndex.layout = (page) => <Layout>{page}</Layout>;
