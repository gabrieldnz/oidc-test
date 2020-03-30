export default {
    features: {
        devInteractions: {enabled: false}, // defaults to true
        userinfo: {enabled: false},
        jwtUserInfo: {enabled: false},
        deviceFlow: {enabled: false}, // defaults to false
        introspection: {enabled: true}, // defaults to false
        revocation: {enabled: true} // defaults to false
    },
    ttl: {
        AccessToken: 1 * 60 * 60, // 1 hour in seconds
        AuthorizationCode: 10 * 60, // 10 minutes in seconds
        IdToken: 1 * 60 * 60, // 1 hour in seconds
        DeviceCode: 10 * 60, // 10 minutes in seconds
        RefreshToken: 1 * 365 * 24 * 60 * 60, // 1 year in seconds
    },
    rotateRefreshToken: true
};
