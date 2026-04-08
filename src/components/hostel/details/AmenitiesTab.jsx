import React from 'react';
import AmenityIcon from '../../AmenityIcon';
import { SectionCard, SectionTitle } from './Shared';

export default function AmenitiesTab({ hostel }) {
    return (
        <div className="space-y-6">
            {hostel.amenities?.length > 0 && (
                <SectionCard className="p-8">
                    <SectionTitle>Amenities</SectionTitle>
                    <div className="flex flex-wrap gap-5 mt-6">
                        {hostel.amenities.map(a => <AmenityIcon key={a.amenity_id} icon={a.icon} name={a.name} variant="tile" />)}
                    </div>
                </SectionCard>
            )}
            {hostel.services?.length > 0 && (
                <SectionCard className="p-8">
                    <SectionTitle>Services</SectionTitle>
                    <div className="flex flex-wrap gap-5 mt-6">
                        {hostel.services.map(s => <AmenityIcon key={s.service_id} icon={s.icon} name={s.name} variant="tile" />)}
                    </div>
                </SectionCard>
            )}
            {!hostel.amenities?.length && !hostel.services?.length && (
                <SectionCard className="p-16 text-center">
                    <p className="text-gray-400 text-sm font-medium">No amenities or services listed.</p>
                </SectionCard>
            )}
        </div>
    );
}
