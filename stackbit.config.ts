//stackbit.config.ts
import { defineStackbitConfig, DocumentStringLikeFieldNonLocalized, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

const gitContentSource = new GitContentSource({
    rootPath: __dirname,
    contentDirs: ['content'],
    models: [
        {
            name: "Page",
            type: "page",
            urlPath: "/{slug}",
            filePath: "content/pages/{slug}.json",
            fields: [{ name: "title", type: "string", required: true }]
        },
        {
            name: "PageLayout",
            type: "page",
            urlPath: "/{slug}",
            filePath: "content/pages/{slug}.md",
            fields: [
                { name: "title", type: "string", required: true },
                { name: "slug", type: "string", required: true }
            ]
        }
    ],
    assetsConfig: {
        referenceType: 'static',
        staticDir: 'public',
        uploadDir: 'images',
        publicPath: '/'
    }
});

const config = defineStackbitConfig({
    stackbitVersion: '~0.7.0',
    ssgName: 'nextjs',
    nodeVersion: '18',
    styleObjectModelName: 'ThemeStyle',
    contentSources: [
        gitContentSource
    ],
    presetSource: {
        type: 'files',
        presetDirs: ['sources/local/presets']
    },
    siteMap: ({ documents, models }): SiteMapEntry[] => {
        const pageModels = models.filter((model) => model.type === 'page').map((model) => model.name);
        return documents
            .filter((document) => pageModels.includes(document.modelName))
            .map((document) => {
                let slug = (document.fields.slug as DocumentStringLikeFieldNonLocalized)?.value;
                if (!slug) return null;
                if (slug === '/') {
                    return {
                        urlPath: '/',
                        document: document
                    };
                }
                slug = slug.replace(/^\/+/, '');
                return {
                    urlPath: `/${slug}`,
                    document: document
                };
            })
            .filter((entry) => entry !== null) as SiteMapEntry[];
    }
});

export default config;