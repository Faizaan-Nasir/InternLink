import BlacklistList from './BlacklistList';

export default function BlacklistSection({ students, universities, onAddStudent }) {
    return (
        <section className='company-info-blacklists'>
            <h2 className='company-info-section-title'>Blacklists</h2>

            <div className='company-info-blacklists-grid'>
                <BlacklistList
                    title='Students Blacklist'
                    items={students}
                    buttonLabel='Add Student'
                    onAdd={onAddStudent}
                />
                <BlacklistList
                    title='Universities Blacklist'
                    items={universities}
                />
            </div>
        </section>
    );
}
