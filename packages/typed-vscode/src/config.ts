export const defaultConfig = {
    target: 'native' as 'native' | 'bare',
    trimIds: true,
    out: 'src/generated.ts',
}

export type Config = typeof defaultConfig

export type UserConfig = Partial<Config>
