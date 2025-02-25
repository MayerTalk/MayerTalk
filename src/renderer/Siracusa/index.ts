import { SettingsManager } from '@/lib/data/settings';
import type { RendererGenericSettings } from '@/lib/data/settings';

interface RendererSettings extends RendererGenericSettings {
    showCharName: boolean,
    showCharNameSettings: Record<string, boolean>
}

const DEFAULT_RENDERER_SETTINGS: Readonly<RendererSettings> = {
    background: '#303030',
    showCharName: false,
    showCharNameSettings: {
        chat: true,
        monologue: true,
        image: true,
        option: false,
        select: false,
        title: false
    }
}

const RendererSettingsManager = new SettingsManager<RendererSettings>({
    type: 'renderer',
    key: 'Siracusa',
    default: DEFAULT_RENDERER_SETTINGS
})

const rendererSettings = RendererSettingsManager.ref

export {
    DEFAULT_RENDERER_SETTINGS,
    RendererSettingsManager,
    rendererSettings
}
