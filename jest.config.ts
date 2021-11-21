const config = {
    testPathIgnorePatterns: ['/build/', '/fixture/'],
    transform: {
        '^.+\\.tsx?$': 'esbuild-runner/jest',
    },
}

export default config
