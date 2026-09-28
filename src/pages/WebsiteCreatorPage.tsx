import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Toast } from '@/components/common/Toast';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorDetailsTab } from '@/components/editor/EditorDetailsTab';
import { EditorPhotosTab } from '@/components/editor/EditorPhotosTab';
import { EditorAppearanceTab } from '@/components/editor/EditorAppearanceTab';
import { EditorSectionsTab } from '@/components/editor/EditorSectionsTab';
import { LivePreviewFrame } from '@/components/editor/LivePreviewFrame';
import { getTemplateDefinition, getTemplateById } from '@/templates/registry';
import { eventService } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { EventData, EventWebsite } from '@/types';
import { slugify } from '@/utils/formatting';

export const WebsiteCreatorPage: React.FC = () => {
  const { user } = useAuth();
  const { templateId, websiteId } = useParams<{ templateId?: string; websiteId?: string }>();
  const navigate = useNavigate();

  const activeTemplateId = templateId || 'enrolldesk-01';
  const templateDef = getTemplateDefinition(activeTemplateId) || getTemplateDefinition('wedding-01');
  const templateMeta = getTemplateById(activeTemplateId) || getTemplateById('wedding-01');

  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'appearance' | 'sections'>('details');
  const [eventData, setEventData] = useState<EventData>(() => {
    return templateDef ? JSON.parse(JSON.stringify(templateDef.defaultData)) : ({} as EventData);
  });
  const [currentWebsite, setCurrentWebsite] = useState<EventWebsite | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const loadExisting = async () => {
      if (websiteId) {
        const site = await eventService.getWebsiteById(websiteId);
        if (site) {
          setCurrentWebsite(site);
          setEventData(site.eventData);
        }
      } else if (templateDef) {
        setEventData(JSON.parse(JSON.stringify(templateDef.defaultData)));
      }
    };
    loadExisting();
  }, [websiteId, activeTemplateId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const handleDataChange = (updates: Partial<EventData>) => {
    setEventData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const slug = currentWebsite?.slug || slugify(eventData.title || 'event-moment');

      if (currentWebsite) {
        await eventService.updateEventData(currentWebsite.id, eventData);
        triggerToast('Draft saved successfully');
      } else {
        const newSite = await eventService.createWebsite({
          userId: user?.id || 'usr_guest',
          templateId: activeTemplateId,
          title: eventData.title || 'My Event Website',
          eventType: templateMeta?.categoryLabel || 'Celebration',
          slug,
          eventData,
        });
        setCurrentWebsite(newSite);
        triggerToast('New draft created and saved');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const slug = currentWebsite?.slug || slugify(eventData.title || 'event-moment');

      let siteId = currentWebsite?.id;
      if (!currentWebsite) {
        const newSite = await eventService.createWebsite({
          userId: user?.id || 'usr_guest',
          templateId: activeTemplateId,
          title: eventData.title || 'My Event Website',
          eventType: templateMeta?.categoryLabel || 'Celebration',
          slug,
          eventData,
        });
        siteId = newSite.id;
        setCurrentWebsite(newSite);
      }

      if (siteId) {
        await eventService.updateWebsite(siteId, {
          status: 'published',
          eventData,
        });
        triggerToast('Website published successfully!');
        setTimeout(() => {
          navigate(`/e/${slug}`);
        }, 1200);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const templateNameDisplay = `${templateMeta?.name || 'EnrollDesk'} (${templateMeta?.categoryLabel || 'Student & Campus'})`;
  const previewSlug = currentWebsite?.slug || slugify(eventData.title || 'enrolldesk-portal');

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <Toast message={toastMessage} isVisible={toastVisible} />

      <main className="w-full pt-[72px] min-h-screen bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Sub-header Editor Bar */}
          <EditorHeader
            templateName={templateNameDisplay}
            isSaving={isSaving}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isPublished={currentWebsite?.status === 'published'}
          />

          {/* Editor Workspace: Controls & Live Preview Split */}
          <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
              {/* Left Column: Tabbed Controls */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                {/* 4 Tabs Bar */}
                <div className="bg-surface-container-high p-1 rounded-xl grid grid-cols-4 gap-1 shadow-sm">
                  <button
                    className={`tab-button py-space-xs px-space-sm rounded-lg font-label-md text-label-md text-center transition-all cursor-pointer ${
                      activeTab === 'details'
                        ? 'bg-surface text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('details')}
                    type="button"
                  >
                    Details
                  </button>
                  <button
                    className={`tab-button py-space-xs px-space-sm rounded-lg font-label-md text-label-md text-center transition-all cursor-pointer ${
                      activeTab === 'photos'
                        ? 'bg-surface text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('photos')}
                    type="button"
                  >
                    Photos
                  </button>
                  <button
                    className={`tab-button py-space-xs px-space-sm rounded-lg font-label-md text-label-md text-center transition-all cursor-pointer ${
                      activeTab === 'appearance'
                        ? 'bg-surface text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('appearance')}
                    type="button"
                  >
                    Appearance
                  </button>
                  <button
                    className={`tab-button py-space-xs px-space-sm rounded-lg font-label-md text-label-md text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeTab === 'sections'
                        ? 'bg-surface text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('sections')}
                    type="button"
                  >
                    <span>Functions</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9982F]" />
                  </button>
                </div>

                {/* Tab Content Panel */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-lg max-h-[calc(100vh-230px)] overflow-y-auto border border-surface-container">
                  {activeTab === 'details' && (
                    <EditorDetailsTab data={eventData} onChange={handleDataChange} />
                  )}
                  {activeTab === 'photos' && (
                    <EditorPhotosTab
                      data={eventData}
                      onChange={handleDataChange}
                      onToast={triggerToast}
                    />
                  )}
                  {activeTab === 'appearance' && (
                    <EditorAppearanceTab data={eventData} onChange={handleDataChange} />
                  )}
                  {activeTab === 'sections' && (
                    <EditorSectionsTab data={eventData} onChange={handleDataChange} />
                  )}
                </div>
              </div>

              {/* Right Column: Live Interactive Device Preview Frame */}
              <LivePreviewFrame
                templateId={activeTemplateId}
                data={eventData}
                slug={previewSlug}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
