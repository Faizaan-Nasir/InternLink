import { useState } from 'react';

export default function BlacklistList({ title, items, listType, onItemClick }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const activeItem = items.includes(selectedItem) ? selectedItem : (items[0] ?? null);

    function handleItemClick(item) {
        setSelectedItem(item);
        onItemClick?.(listType, item);
    }

    return (
        <div className='company-info-blacklist-column'>
            <div className='company-info-blacklist-head'>
                <h3 className='company-info-blacklist-title'>{title}</h3>
            </div>

            <div className='company-info-tabs-scroll'>
                {items.map((item, index) => (
                    <button
                        key={`${item}-${index}`}
                        type='button'
                        className={`panel-row applicants-row company-info-tab${activeItem === item ? ' panel-row-selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <span className='applicants-row-name'>{item}</span>
                        <span className='applicants-row-meta'>Blacklisted</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
