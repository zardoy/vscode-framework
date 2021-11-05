import { defineJestConfig } from '@zardoy/jest-config'

const config = {
    testPathIgnorePatterns: ['/build/'],
    transform: {
        '^.+\\.tsx?$': 'esbuild-runner/jest',
    },
}

export default config
