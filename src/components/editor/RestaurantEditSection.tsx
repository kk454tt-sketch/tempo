import React, { useState } from 'react';
import { EventPhoto, RestaurantData, TastingCourseItem } from '@/types';
import { CategoryPhotoUploader } from './CategoryPhotoUploader';
import { LocationMapData, LocationMapPicker } from './LocationMapPicker';

interface RestaurantEditSectionProps {
  title: string;
  tagline: string;
  note: string;
  venue: string;
  address: string;
  date: string;
  photos: EventPhoto[];
  restaurantData?: RestaurantData;
  locationMap: LocationMapData;
  onChangeTitle: (title: string) => void;
  onChangeTagline: (tagline: string) => void;
  onChangeNote: (note: string) => void;
  onChangeVenue: (venue: string) => void;
  onChangeAddress: (address: string) => void;
  onChangeDate: (date: string) => void;
  onChangePhotos: (photos: EventPhoto[]) => void;
  onChangeRestaurantData: (data: RestaurantData) => void;
  onChangeLocationMap: (map: LocationMapData) => void;
  onToast: (msg: string) => void;
}

export const RestaurantEditSection: React.FC<RestaurantEditSectionProps> = ({
  title,
  tagline,
  note,
  venue,
  address,
  date,
  photos,
  restaurantData,
  locationMap,
  onChangeTitle,
  onChangeTagline,
  onChangeNote,
  onChangeVenue,
  onChangeAddress,
  onChangeDate,
  onChangePhotos,
  onChangeRestaurantData,
  onChangeLocationMap,
  onToast,
}) => {
  const [tab, setTab] = useState<'restaurant' | 'menu' | 'media' | 'booking'>('restaurant');

  const menu: TastingCourseItem[] = restaurantData?.menu && restaurantData.menu.length > 0
    ? restaurantData.menu
    : [
        {
          id: 'course-1',
          course: 'Course 01 · Amuse',
          name: 'Smoked Hokkaido Scallop & Shiso Gelée',
          pairing: '2022 Domaine Leflaive Bourgogne Blanc',
          desc: 'Infused with roasted nori dashi and fermented finger lime caviar pearls.',
          price: '$28',
        },
        {
          id: 'course-2',
          course: 'Course 02 · Raw',
          name: 'Wild Bluefin Chutoro & Aged Shoyu',
          pairing: 'Junmai Daiginjo "Born Gold" Fukui',
          desc: 'Line-caught coastal tuna aged 7 days with house-cured wasabi root.',
          price: '$34',
        },
        {
          id: 'course-3',
          course: 'Course 03 · Hearth',
          name: 'Binchotan Grilled A5 Wagyu Tenderloin',
          pairing: '2019 Tenuta San Guido Guidalberto',
          desc: 'Charred over Japanese white oak coals with black garlic tare reduction.',
          price: '$65',
        },
        {
          id: 'course-4',
          course: 'Course 04 · Sweet',
          name: 'Roasted Soba Tea Gelato & Kinako Tuile',
          pairing: 'Aged 10-Year Plum Wine Liqueur',
          desc: 'Warm smoked cedar infusion with organic buckwheat crisp.',
          price: '$18',
        },
      ];

  const updateRestaurantField = <K extends keyof RestaurantData>(field: K, value: RestaurantData[K]) => {
    const updated: RestaurantData = {
      menu,
      ...restaurantData,
      [field]: value,
    };
    onChangeRestaurantData(updated);
  };

  const handleAddCourse = () => {
    const newCourse: TastingCourseItem = {
      id: `course-${Date.now()}`,
      course: `Course 0${menu.length + 1} · Entrée`,
      name: 'Chef Seasonal Creation',
      pairing: 'Natural Wine Pairing',
      desc: 'Locally harvested seasonal produce with house-fermented glaze.',
      price: '$32',
    };
    const updatedMenu = [...menu, newCourse];
    updateRestaurantField('menu', updatedMenu);
    onToast('Added tasting menu course');
  };

  const handleUpdateCourse = (id: string, field: keyof TastingCourseItem, val: string) => {
    const updatedMenu = menu.map((c) => (c.id === id ? { ...c, [field]: val } : c));
    updateRestaurantField('menu', updatedMenu);
  };

  const handleRemoveCourse = (id: string) => {
    const updatedMenu = menu.filter((c) => c.id !== id);
    updateRestaurantField('menu', updatedMenu);
    onToast('Removed menu course');
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container-high/60 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setTab('restaurant')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'restaurant' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          1. Restaurant &amp; Hours
        </button>
        <button
          type="button"
          onClick={() => setTab('menu')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'menu' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          2. Tasting Menu ({menu.length} Courses)
        </button>
        <button
          type="button"
          onClick={() => setTab('media')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'media' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          3. Dining Imagery &amp; Ambiance
        </button>
        <button
          type="button"
          onClick={() => setTab('booking')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            tab === 'booking' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          4. Philosophy &amp; Reservations
        </button>
      </div>

      {/* TAB 1: Restaurant & Hours */}
      {tab === 'restaurant' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">restaurant</span>
              <span>Restaurant Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onChangeTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Komorebi Dining"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cuisine / Concept Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => onChangeTagline(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Contemporary Omakase & Cocktail Lounge"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Operating Days &amp; Hours</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => onChangeDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Open Tuesday – Sunday · 5:30 PM - 11:00 PM"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Lounge / Pavilion Name</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => onChangeVenue(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                  placeholder="e.g. Komorebi Kyoto Lounge"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Address &amp; Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => onChangeAddress(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                placeholder="e.g. 74 Gion-machi Minamigawa, Kyoto"
              />
            </div>

            <LocationMapPicker
              venue={venue}
              address={address}
              locationMap={locationMap}
              onChangeVenue={onChangeVenue}
              onChangeAddress={onChangeAddress}
              onChangeLocationMap={onChangeLocationMap}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Tasting Menu */}
      {tab === 'menu' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">dinner_dining</span>
                  <span>Tasting Sequence Menu</span>
                </h2>
                <p className="text-xs text-gray-500">Edit course titles, dish descriptions, pairings, and prices.</p>
              </div>

              <button
                type="button"
                onClick={handleAddCourse}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Course</span>
              </button>
            </div>

            <div className="space-y-4">
              {menu.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary font-mono uppercase">
                      Sequence {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete course"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Course Label</label>
                      <input
                        type="text"
                        value={item.course}
                        onChange={(e) => handleUpdateCourse(item.id, 'course', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-mono"
                        placeholder="e.g. Course 01 · Amuse"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Dish Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateCourse(item.id, 'name', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-semibold"
                        placeholder="e.g. Smoked Hokkaido Scallop"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Pairing (Wine / Sake / Tea)</label>
                      <input
                        type="text"
                        value={item.pairing || ''}
                        onChange={(e) => handleUpdateCourse(item.id, 'pairing', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs"
                        placeholder="e.g. 2022 Domaine Leflaive Bourgogne Blanc"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Course Price (Optional)</label>
                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateCourse(item.id, 'price', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-surface-container-high text-xs font-mono"
                        placeholder="e.g. $28 or Included"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-0.5">Description &amp; Ingredients</label>
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => handleUpdateCourse(item.id, 'desc', e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-surface-container-high text-xs"
                      placeholder="e.g. Infused with roasted nori dashi and fermented finger lime caviar pearls."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Media */}
      {tab === 'media' && (
        <CategoryPhotoUploader
          category="restaurant"
          photos={photos}
          onChangePhotos={onChangePhotos}
          onToast={onToast}
          title="Culinary Photography &amp; Interior Ambiance"
          subtitle="Highlight signature dishes, ceramic dining presentations, and hearth lounge interiors."
        />
      )}

      {/* TAB 4: Philosophy & Reservations */}
      {tab === 'booking' && (
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
            <span>Culinary Philosophy &amp; Reservations</span>
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Chef Philosophy / Provenance Story</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => onChangeNote(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
              placeholder="e.g. Seasonal 10-course tasting sequence honoring Kyoto micro-climates, raw seafood provenance, and binchotan wood-fired culinary craft."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Tasting Sequence Price per Guest</label>
              <input
                type="text"
                value={restaurantData?.pricePerGuest || '$185'}
                onChange={(e) => updateRestaurantField('pricePerGuest', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                placeholder="e.g. $185 per guest"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Direct Booking / OpenTable URL</label>
              <input
                type="url"
                value={restaurantData?.bookingUrl || ''}
                onChange={(e) => updateRestaurantField('bookingUrl', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-surface border border-surface-container-high text-xs text-gray-900 focus:outline-none focus:border-primary"
                placeholder="https://opentable.com/..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
