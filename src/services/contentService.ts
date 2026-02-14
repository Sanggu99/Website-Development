import { ProjectData } from '../../types';
import { NewsItem, newsData } from '../../newsData';
import { projectsData } from '../../data';

// Placeholder type until proper People data structure is consolidated
export interface Person {
    id: number;
    nameEn: string;
    nameKr: string;
    role: string;
    imageBw: string;
    imageColor: string;
}

// Initial mock people data matching People.tsx
const initialPeople: Person[] = Array(16).fill({
    nameEn: 'SANGSUN PARK',
    nameKr: '박상선',
    role: 'CEO',
    imageBw: '/people/흑백/박상선.jpg',
    imageColor: '/people/컬러/박상선.JPG'
}).map((p, i) => ({ ...p, id: i + 1 }));


import { supabase } from '../supabaseClient';

class ContentService {
    private _projects: ProjectData[] = [];
    private _news: NewsItem[] = [];
    private _people: Person[] = [];

    constructor() {
        this.loadInitialData();
        // Background fetch to sync with cloud
        this.fetchAllFromCloud();
    }

    private loadInitialData() {
        // Projects
        const storedProjects = localStorage.getItem('seop_projects');
        this._projects = storedProjects ? JSON.parse(storedProjects) : projectsData;

        // News
        const storedNews = localStorage.getItem('seop_news');
        this._news = storedNews ? JSON.parse(storedNews) : newsData;

        // People
        const storedPeople = localStorage.getItem('seop_people');
        this._people = storedPeople ? JSON.parse(storedPeople) : initialPeople;
    }

    private async fetchAllFromCloud() {
        await Promise.all([
            this.fetchProjects(),
            this.fetchPeople(),
            this.fetchNews(),
            this.fetchRecentWorks()
        ]);
        console.log('Cloud sync complete');
    }

    // --- Projects ---
    getProjects(): ProjectData[] {
        return this._projects;
    }

    async fetchProjects() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                // Map DB snake_case columns to TS camelCase
                const mapped: ProjectData[] = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    titleEn: d.title_en,
                    location: d.location,
                    year: d.year,
                    heroImage: d.hero_image,
                    thumbnailImage: d.thumbnail_image,
                    thumbnailAspectRatio: d.thumbnail_aspect_ratio,
                    thumbnailObjectPosition: d.thumbnail_object_position,
                    thumbnailScale: d.thumbnail_scale,
                    category: d.category,
                    facts: d.facts,
                    blocks: d.blocks,
                    description: d.description || [],
                    galleryImages: d.gallery_images || []
                }));

                this._projects = mapped;
                this.saveToLocal('seop_projects', this._projects);
                window.dispatchEvent(new Event('seop_projects_updated'));
            } else {
                // SEEDING: If DB is empty, check if we have local data. 
                // If local is empty too, fallback to imported hardcoded data.
                console.log('Database empty. Seeding initial projects...');

                if (this._projects.length === 0) {
                    console.log('Local projects empty. Using hardcoded projectsData.');
                    this._projects = projectsData;
                    this.saveToLocal('seop_projects', this._projects);
                    window.dispatchEvent(new Event('seop_projects_updated'));
                }

                for (const p of this._projects) {
                    await this.saveProject(p);
                }
            }
        } catch (e) {
            console.warn('Failed to fetch projects from cloud:', e);
        }
    }

    async saveProjects(projects: ProjectData[]) {
        // 1. Optimistic Update (Local)
        this._projects = projects;
        this.saveToLocal('seop_projects', projects);
        window.dispatchEvent(new Event('seop_projects_updated'));

        // 2. Cloud Update
        if (!supabase) return;

        try {
            // For reordering, we need to update ALL projects or at least their order index.
            // Since we don't have an explicit 'order' column, we rely on the implied order of insertion or ID.
            // However, Supabase/Postgres doesn't guarantee order unless we have a sort column.
            // BUT, for this simple app, we might be relying on the JSON order or recreating the list.

            // CRITICAL FIX: The user wants reordering to work.
            // Strategy: We will update the 'id' or a new 'sort_order' column if we had one.
            // As a quick fix without DB migration, we will save each project in the new order 
            // but that doesn't change the DB order unless we delete and re-insert (too risky).

            // BETTER STRATEGY: Update the local cache is enough for the current user, 
            // but for OTHER users, we need a persistent order.
            // Let's assume the client expects us to save the *content*. 
            // If the user reordered them, we should probably save that order.

            console.log('Saving all projects to persist order/bulk changes...');
            // We'll optimistically try to upsert all. This might be heavy but correct for small datasets.
            for (const p of projects) {
                await this.saveProject(p);
            }
        } catch (e) {
            console.error('Cloud save failed:', e);
        }
    }

    // New Method for Individual Cloud Save
    async saveProject(project: ProjectData) {
        // Update local list
        const textBlocks = project.blocks ? JSON.stringify(project.blocks).length : 0;
        console.log(`Saving project ${project.id} with ${textBlocks} chars of block data`);

        const index = this._projects.findIndex(p => p.id === project.id);
        if (index >= 0) {
            this._projects[index] = project;
        } else {
            this._projects.unshift(project);
        }
        this.saveToLocal('seop_projects', this._projects);
        window.dispatchEvent(new Event('seop_projects_updated'));

        // Update Cloud
        if (!supabase) return;

        try {
            const dbPayload = {
                id: project.id, // If new (Date.now()), this might conflict with BigInt auto-increment. Ideally let DB assign ID for new.
                title: project.title,
                title_en: project.titleEn,
                location: project.location,
                year: project.year,
                hero_image: project.heroImage,
                thumbnail_image: project.thumbnailImage,
                thumbnail_aspect_ratio: project.thumbnailAspectRatio,
                thumbnail_object_position: project.thumbnailObjectPosition,
                thumbnail_scale: project.thumbnailScale,
                category: Array.isArray(project.category) ? project.category : [project.category],
                facts: project.facts,
                blocks: project.blocks,
                gallery_images: project.galleryImages,
                description: project.description
            };

            // Remove ID if it looks like a temporary timestamp ID (e.g. > 1000000000)
            // so Supabase generates a sequential ID
            if (project.id > 1700000000000) {
                // @ts-ignore
                delete dbPayload.id;
            }

            const { data, error } = await supabase
                .from('projects')
                .upsert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                // Update with real ID from server
                if (project.id > 1700000000000) {
                    const realId = data.id;
                    const pIndex = this._projects.findIndex(p => p.id === project.id);
                    if (pIndex >= 0) {
                        this._projects[pIndex] = { ...this._projects[pIndex], id: realId };
                        this.saveToLocal('seop_projects', this._projects);
                        window.dispatchEvent(new Event('seop_projects_updated'));
                    }
                }
            }
        } catch (e) {
            console.error('Failed to save project to cloud:', e);
            throw e; // Re-throw so UI can handle it
        }
    }

    // --- News ---
    getNews(): NewsItem[] {
        return this._news;
    }

    async fetchNews() {
        if (!supabase) return;
        try {
            // Revert to ID Ascending (ID 1 is Top) to match Save Order logic
            const { data, error } = await supabase.from('news').select('*').order('id', { ascending: true });
            if (error) throw error;
            if (data && data.length > 0) {
                // Map snake_case to camelCase for News
                this._news = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    summary: d.summary,
                    date: d.date,
                    category: d.category,
                    image: d.image,
                    content: d.content,
                    showAsPopup: d.show_as_popup,
                    externalLink: d.external_link,
                    layoutType: d.layout_type,
                    aspectRatio: d.aspect_ratio,
                    objectPosition: d.object_position,
                    fontSize: d.font_size,
                    fontWeight: d.font_weight,
                    contentFontSize: d.content_font_size,
                    contentFontWeight: d.content_font_weight
                }));
                this.saveToLocal('seop_news', this._news);
                window.dispatchEvent(new Event('seop_news_updated'));
            } else {
                // SEEDING
                console.log('Database empty. Seeding initial news...');

                if (this._news.length === 0) {
                    this._news = newsData;
                    this.saveToLocal('seop_news', this._news);
                    window.dispatchEvent(new Event('seop_news_updated'));
                }

                for (const n of this._news) {
                    await this.saveNewsItem(n);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    async saveNews(newsList: NewsItem[]) {
        this._news = newsList;
        this.saveToLocal('seop_news', newsList);
        window.dispatchEvent(new Event('seop_news_updated'));
        // Removed cloud sync loop to prevent infinite recursion
    }

    async saveNewsItem(item: NewsItem) {
        const isNewItem = item.id > 1700000000000; // Check if it's a timestamp ID

        // Update Local
        const index = this._news.findIndex(n => n.id === item.id);
        if (index >= 0) this._news[index] = item;
        else this._news.unshift(item); // Add to top

        // Update Local State
        this.saveToLocal('seop_news', this._news);
        window.dispatchEvent(new Event('seop_news_updated'));

        if (!supabase) return;

        // CRITICAL: If New Item, we MUST Reorder All to make it ID 1
        if (isNewItem) {
            console.log('New News Item detected. Triggering full reorder to assign ID 1...');
            await this.resetIdsAndSaveOrder(this._news, 'news');
            return;
        }

        // Normal Update (Upsert)
        try {
            const payload = {
                id: item.id,
                title: item.title,
                date: item.date,
                category: item.category,
                summary: item.summary,
                image: item.image,
                content: item.content,
                show_as_popup: item.showAsPopup,
                external_link: item.externalLink,
                layout_type: item.layoutType,
                aspect_ratio: item.aspectRatio,
                object_position: item.objectPosition,
                font_size: item.fontSize,
                font_weight: item.fontWeight,
                content_font_size: item.contentFontSize,
                content_font_weight: item.contentFontWeight
            };

            const { error } = await supabase.from('news').upsert(payload);
            if (error) throw error;
        } catch (e) { console.error(e); }
    }

    // --- People ---
    getPeople(): Person[] {
        return this._people;
    }

    async fetchPeople() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase.from('people').select('*').order('id', { ascending: true });
            if (error) throw error;
            if (data && data.length > 0) {
                // Map snake_case to camelCase
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    nameEn: d.name_en,
                    nameKr: d.name_kr,
                    role: d.role,
                    imageBw: d.image_bw,
                    imageColor: d.image_color
                }));
                this._people = mapped;
                this.saveToLocal('seop_people', this._people);
                window.dispatchEvent(new Event('seop_people_updated'));
            } else {
                // SEEDING
                console.log('Database empty. Seeding initial people...');

                if (this._people.length === 0) {
                    this._people = initialPeople;
                    this.saveToLocal('seop_people', this._people);
                    window.dispatchEvent(new Event('seop_people_updated'));
                }

                for (const p of this._people) {
                    await this.savePerson(p);
                }
            }
        } catch (e) { console.warn(e); }
    }

    async savePeople(people: Person[]) {
        this._people = people;
        this.saveToLocal('seop_people', people);
        window.dispatchEvent(new Event('seop_people_updated'));

        // Cloud Sync for reordering
        if (supabase) {
            for (const p of people) {
                await this.savePerson(p);
            }
        }
    }

    async savePerson(person: Person) {
        // Update Local
        const index = this._people.findIndex(p => p.id === person.id);
        if (index >= 0) this._people[index] = person;
        else this._people.push(person); // People usually append
        this.savePeople(this._people);

        // Update Cloud
        if (!supabase) return;
        try {
            const payload = {
                id: person.id,
                name_en: person.nameEn,
                name_kr: person.nameKr,
                role: person.role,
                image_bw: person.imageBw,
                image_color: person.imageColor
            };
            // @ts-ignore
            if (payload.id > 1700000000000) delete payload.id;

            const { error } = await supabase.from('people').upsert(payload);
            if (error) throw error;
        } catch (e) { console.error(e); }
    }

    // --- Image Upload ---
    // --- Image Upload with Compression ---
    async uploadImage(file: File): Promise<string> {
        if (!supabase) throw new Error('Supabase not configured');

        // Compress image if it's an image type
        let fileToUpload = file;
        if (file.type.startsWith('image/')) {
            try {
                fileToUpload = await this.compressImage(file);
            } catch (e) {
                console.warn('Image compression failed, uploading original:', e);
            }
        }

        const fileExt = 'webp'; // We convert to webp
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, fileToUpload);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        return data.publicUrl;
    }

    // Helper: Compress and Convert to WebP
    private async compressImage(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimension rules (e.g., HD)
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                    type: 'image/webp',
                                    lastModified: Date.now(),
                                });
                                resolve(newFile);
                            } else {
                                reject(new Error('Canvas to Blob failed'));
                            }
                        }, 'image/webp', 0.8); // 0.8 quality
                    } else {
                        reject(new Error('Canvas context failed'));
                    }
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    // --- Emergency Restore ---
    // --- Emergency Restore ---
    async restoreDefaults(force: boolean = false) {
        if (force || confirm('Warning: This will ERASE all current cloud data and restore the original hardcoded defaults. Continue?')) {
            try {
                await this.resetIdsAndSaveOrder(projectsData, 'projects');
                await this.resetIdsAndSaveOrder(newsData, 'news');
                // @ts-ignore
                if (typeof initialPeople !== 'undefined') await this.resetIdsAndSaveOrder(initialPeople, 'people');

                if (!force) alert('System restored to default data.');

                if (!force) window.location.reload();
            } catch (e) {
                if (!force) alert('Restore failed. See console.');
                else console.error('Restore failed:', e);
            }
        }
    }

    // --- Order Management (Reset IDs) ---
    async resetIdsAndSaveOrder(items: any[], tableName: 'projects' | 'news' | 'people') {
        if (!supabase) return;
        if (!items || items.length === 0) {
            console.warn('No items to reset ordering for.');
            return;
        }

        try {
            console.log(`Resetting IDs for ${tableName}...`);

            // 1. Delete All (Truncate-like behavior)
            // Warning: This is destructive. We rely on 'items' being a complete, safe copy.
            const { error: deleteError } = await supabase
                .from(tableName)
                .delete()
                .neq('id', 0); // Delete all where ID is not 0 (effectively all)

            if (deleteError) throw deleteError;

            // 2. Re-insert with sequential IDs
            const itemsWithNewIds = items.map((item, index) => {
                const newItem = { ...item };
                newItem.id = index + 1; // 1-based index

                // Sanitization for DB payload
                if (tableName === 'projects') {
                    return {
                        id: newItem.id, // Explicit ID
                        title: item.title,
                        title_en: item.titleEn || item.title_en,
                        location: item.location,
                        year: item.year,
                        hero_image: item.heroImage || item.hero_image,
                        category: Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []),
                        facts: item.facts,
                        blocks: item.blocks,
                        gallery_images: item.galleryImages || item.gallery_images,
                        description: item.description
                    };
                } else if (tableName === 'news') {
                    return {
                        id: newItem.id,
                        title: item.title,
                        summary: item.summary,
                        date: item.date,
                        category: item.category,
                        image: item.image,
                        content: item.content,
                        show_as_popup: item.showAsPopup || item.show_as_popup,
                        external_link: item.externalLink || item.external_link,
                        layout_type: item.layoutType || item.layout_type,
                        aspect_ratio: item.aspectRatio || item.aspect_ratio,
                        object_position: item.objectPosition || item.object_position,
                        font_size: item.fontSize || item.font_size,
                        font_weight: item.fontWeight || item.font_weight,
                        content_font_size: item.contentFontSize || item.content_font_size,
                        content_font_weight: item.contentFontWeight || item.content_font_weight
                    };
                } else if (tableName === 'people') {
                    return {
                        id: newItem.id,
                        name_en: item.nameEn || item.name_en,
                        name_kr: item.nameKr || item.name_kr,
                        role: item.role,
                        image_bw: item.imageBw || item.image_bw,
                        image_color: item.imageColor || item.image_color
                    };
                }
                return newItem;
            });

            // Batch Insertion
            const { error: insertError } = await supabase
                .from(tableName)
                .insert(itemsWithNewIds);

            if (insertError) throw insertError;

            // 3. Update Local State
            if (tableName === 'projects') {
                this._projects = items.map((item, index) => ({ ...item, id: index + 1 }));
                this.saveToLocal('seop_projects', this._projects);
                window.dispatchEvent(new Event('seop_projects_updated'));
            } else if (tableName === 'news') {
                this._news = items.map((item, index) => ({ ...item, id: index + 1 }));
                this.saveToLocal('seop_news', this._news);
                window.dispatchEvent(new Event('seop_news_updated'));
            } else if (tableName === 'people') {
                this._people = items.map((item, index) => ({ ...item, id: index + 1 }));
                this.saveToLocal('seop_people', this._people);
                window.dispatchEvent(new Event('seop_people_updated'));
            }

            console.log(`${tableName} reordering complete.`);
            return true;
        } catch (e: any) {
            console.error('Failed to reset IDs:', e);
            alert(`DB Reordering failed: ${e.message}`);
            throw e;
        }
    }

    // --- Migration Tool ---
    async migrateAllLocalImagesToCloud(onProgress: (msg: string) => void) {
        if (!supabase) {
            onProgress('Supabase not connected.');
            return;
        }

        onProgress('Starting migration... This may take a few minutes.');
        let updatedCount = 0;

        // Helper to upload URL string if local
        const processUrl = async (url: string | undefined): Promise<string | undefined> => {
            if (!url || !url.startsWith('/') || url.startsWith('http') || url.startsWith('data:')) return url;

            try {
                // Fetch local file as blob
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const blob = await response.blob();
                const file = new File([blob], url.split('/').pop() || 'image.jpg', { type: blob.type });

                // Upload
                const publicUrl = await this.uploadImage(file);
                updatedCount++;
                onProgress(`Migrated: ${url}`);
                return publicUrl;
            } catch (e) {
                console.error(`Failed to migrate ${url}`, e);
                return url; // Keep original if failed
            }
        };

        // 1. Migrate Projects
        const projects = [...this._projects];
        for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            let changed = false;

            const newHero = await processUrl(p.heroImage);
            if (newHero !== p.heroImage) { p.heroImage = newHero!; changed = true; }

            // Gallery
            if (p.galleryImages) {
                for (const img of p.galleryImages) {
                    const newSrc = await processUrl(img.src);
                    if (newSrc !== img.src) { img.src = newSrc!; changed = true; }
                }
            }

            // Blocks (Visual Editor)
            if (p.blocks) {
                for (const b of p.blocks) {
                    if (b.type === 'image' || b.type === 'hero') {
                        const newSrc = await processUrl(b.content.src);
                        if (newSrc !== b.content.src) {
                            b.content.src = newSrc;
                            b.content.previewSrc = newSrc; // Update preview too
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                await this.saveProject(p);
                onProgress(`Updated Project: ${p.title}`);
            }
        }

        // 2. Migrate News
        const news = [...this._news];
        for (let i = 0; i < news.length; i++) {
            const n = news[i];
            const newImage = await processUrl(n.image);
            if (newImage !== n.image) {
                n.image = newImage!;
                await this.saveNewsItem(n);
                onProgress(`Updated News: ${n.title}`);
            }
        }

        // 3. Migrate People
        const people = [...this._people];
        for (let i = 0; i < people.length; i++) {
            const p = people[i];
            let changed = false;

            const newBw = await processUrl(p.imageBw);
            if (newBw !== p.imageBw) { p.imageBw = newBw!; changed = true; }

            const newColor = await processUrl(p.imageColor);
            if (newColor !== p.imageColor) { p.imageColor = newColor!; changed = true; }

            if (changed) {
                await this.savePerson(p);
                onProgress(`Updated Person: ${p.nameEn}`);
            }
        }

        onProgress(`Migration complete! ${updatedCount} images moved to cloud.`);
        alert(`Migration finished. ${updatedCount} images uploaded.`);
        window.location.reload();
    }

    // --- Helpers ---
    private saveToLocal(key: string, data: any) {
        try {
            const str = JSON.stringify(data);
            if (str.length > 4500000) {
                console.warn(`Data for ${key} is too large (${str.length} chars) for localStorage. Skipping local cache.`);
                return;
            }
            localStorage.setItem(key, str);
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    // --- Recent Works Layout (Keep Local/Simple for now) ---
    getRecentWorksLayout() {
        const stored = localStorage.getItem('seop_recent_works_layout');
        if (stored) return JSON.parse(stored);
        return [
            { id: '1', name: 'Column 1 (Urban Forest Tower)', items: 1, type: 'Static Images' },
            { id: '2', name: 'Column 2 (Jeju Project)', items: 5, type: 'Project Gallery' },
            { id: '3', name: 'Column 3 (Minimalist Art Gallery)', items: 1, type: 'Static Images' }
        ];
    }

    saveRecentWorksLayout(layout: any) {
        localStorage.setItem('seop_recent_works_layout', JSON.stringify(layout));
        window.dispatchEvent(new Event('seop_recent_works_updated'));
    }

    // --- NEW: Recent Works (DB Backed) ---
    private _recentWorks: RecentWorkData[] = [];

    getRecentWorks(): RecentWorkData[] {
        return this._recentWorks;
    }

    async fetchRecentWorks() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('recent_works')
                .select('*')
                .order('column_index', { ascending: true })
                .order('order_index', { ascending: true });

            if (error) throw error;

            if (data) {
                this._recentWorks = data.map((d: any) => ({
                    id: d.id,
                    title: d.title_en || d.title_kr, // Fallback
                    titleEn: d.title_en,
                    titleKr: d.title_kr,
                    description: d.description,
                    category: d.category,
                    columnIndex: d.column_index,
                    scrollSpeed: d.scroll_speed,
                    thumbnailUrl: d.thumbnail_url,
                    contentBlocks: d.content_blocks,
                    orderIndex: d.order_index
                }));
                window.dispatchEvent(new Event('seop_recent_works_updated'));
            }
        } catch (e) {
            console.warn('Failed to fetch recent works:', e);
        }
    }

    async saveRecentWork(item: RecentWorkData) {
        // Optimistic Update
        const index = this._recentWorks.findIndex(r => r.id === item.id);
        if (index >= 0) this._recentWorks[index] = item;
        else this._recentWorks.push(item);
        window.dispatchEvent(new Event('seop_recent_works_updated'));

        if (!supabase) return;

        try {
            const payload = {
                id: item.id > 1700000000000 ? undefined : item.id,
                title_en: item.titleEn || item.title,
                title_kr: item.titleKr,
                description: item.description,
                category: item.category,
                column_index: item.columnIndex,
                scroll_speed: item.scrollSpeed,
                thumbnail_url: item.thumbnailUrl,
                content_blocks: item.contentBlocks,
                order_index: item.orderIndex
            };

            // @ts-ignore
            if (payload.id === undefined) delete payload.id;

            const { data, error } = await supabase
                .from('recent_works')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            // Update ID if new
            if (data && (!item.id || item.id > 1700000000000)) {
                const realId = data.id;
                const idx = this._recentWorks.findIndex(r => r.id === item.id);
                if (idx >= 0) {
                    this._recentWorks[idx].id = realId;
                    window.dispatchEvent(new Event('seop_recent_works_updated'));
                }
            }
        } catch (e) {
            console.error('Failed to save recent work:', e);
            alert('Save failed');
        }
    }

    async deleteRecentWork(id: number) {
        // Optimistic
        this._recentWorks = this._recentWorks.filter(r => r.id !== id);
        window.dispatchEvent(new Event('seop_recent_works_updated'));

        if (!supabase) return;
        try {
            await supabase.from('recent_works').delete().eq('id', id);
        } catch (e) { console.error(e); }
    }
}

export interface RecentWorkData {
    id: number;
    title: string;
    titleEn?: string;
    titleKr?: string;
    description?: string;
    category?: string;
    columnIndex: number; // 1-3
    scrollSpeed: number; // 0.1 - 5.0
    thumbnailUrl: string;
    contentBlocks: any[];
    orderIndex?: number;
}

export const contentService = new ContentService();
