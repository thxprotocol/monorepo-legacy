'use strict';
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 * https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/
 *
 * Please be aware this file is shared between API and AUTH projects. Since this file mostly serves to disable
 * New Relic on local runs and configuration during production runs is done through env vars this should not
 * lead to issues.
 */
exports.config = {
    agent_enabled: false,
    logging: {
        enabled: false,
    },
    rules: {
        ignore: ['v1/ping'],
    },
    allow_all_headers: true,
    attributes: {
        exclude: [
            'request.headers.cookie',
            'request.headers.authorization',
            'request.headers.proxyAuthorization',
            'request.headers.setCookie*',
            'request.headers.x*',
            'response.headers.cookie',
            'response.headers.authorization',
            'response.headers.proxyAuthorization',
            'response.headers.setCookie*',
            'response.headers.x*',
        ],
    },
};
