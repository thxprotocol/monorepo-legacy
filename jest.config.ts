import { getJestProjects } from '@nrwl/jest';

export default {
    projects: getJestProjects(),
    testTimeout: 30000,
};
