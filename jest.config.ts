import { getJestProjects } from '@nrwl/jest';

export default {
    projects: getJestProjects(),
    transform: {
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
