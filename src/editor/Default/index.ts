import { SettingsManager } from '@/lib/data/settings.ts';

interface EditorSettings {
    characterSelectorPermanent: boolean
}

const DEFAULT_EDITOR_SETTINGS: Readonly<EditorSettings> = {
    characterSelectorPermanent: true,
}

const EditorSettingsManager = new SettingsManager<EditorSettings>({
    type: 'editor',
    key: 'Default',
    default: DEFAULT_EDITOR_SETTINGS
})

const editorSettings = EditorSettingsManager.ref

export {
    DEFAULT_EDITOR_SETTINGS,
    editorSettings,
    EditorSettingsManager
}
